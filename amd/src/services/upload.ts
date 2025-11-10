/**
 * Upload service for MinIO S3 storage.
 * Handles PDF hashing, upload URL generation, file uploads, and cover extraction.
 *
 * @module local_reblibrary/services/upload
 * @copyright 2025 Rwanda Education Board
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// Declare AMD module types for TypeScript
declare const require: any;

/**
 * Upload progress information
 */
export interface UploadProgress {
  stage: 'hashing' | 'requesting_urls' | 'uploading_pdf' | 'extracting_cover' | 'uploading_cover' | 'complete';
  progress: number; // 0-100
  message: string;
  bytesUploaded?: number;
  bytesTotal?: number;
}

/**
 * PDF metadata
 */
export interface PdfMetadata {
  numPages: number;
  title: string;
  author?: string;
  creationDate?: string;
  fileSize: number;
}

/**
 * Compute SHA-256 hash of a file.
 *
 * @param file File to hash
 * @returns Promise resolving to SHA-256 hash (64 hex characters)
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert blob/file to base64 string.
 *
 * @param blob Blob or File to convert
 * @returns Promise resolving to base64 string (without data: prefix)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload PDF and cover to backend API.
 *
 * @param pdfHash SHA-256 hash of PDF file
 * @param pdfFile PDF file
 * @param coverBlob Cover image blob (JPEG)
 * @returns Promise resolving to upload result
 */
async function uploadViaBackend(
  pdfHash: string,
  pdfFile: File,
  coverBlob: Blob
): Promise<{ pdfUrl: string; coverUrl: string }> {
  // Convert files to base64
  const pdfBase64 = await blobToBase64(pdfFile);
  const coverBase64 = await blobToBase64(coverBlob);

  return new Promise((resolve, reject) => {
    require(['core/ajax'], (ajax: any) => {
      ajax.call([{
        methodname: 'local_reblibrary_upload_resource_file',
        args: {
          pdf_hash: pdfHash,
          pdf_content: pdfBase64,
          cover_content: coverBase64,
        }
      }])[0]
        .then((result: any) => {
          if (result.success) {
            resolve({
              pdfUrl: result.pdf_url,
              coverUrl: result.cover_url,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        })
        .catch((error: any) => {
          console.error('Backend upload failed:', error);
          reject(new Error(error.message || 'Failed to upload files'));
        });
    });
  });
}

/**
 * Extract first page of PDF as JPEG image.
 *
 * @param pdfFile PDF file to extract from
 * @param scale Rendering scale (default: 2.0 for high quality)
 * @param quality JPEG quality 0-1 (default: 0.85)
 * @returns Promise resolving to JPEG blob
 */
export async function extractPdfCover(
  pdfFile: File,
  scale: number = 2.0,
  quality: number = 0.85
): Promise<Blob> {
  try {
    // Load PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Get first page
    const page = await pdf.getPage(1);

    // Calculate viewport
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background first (PDFs might have transparency)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Convert to JPEG blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create JPEG blob from canvas'));
          }
        },
        'image/jpeg',
        quality
      );
    });
  } catch (error) {
    console.error('Failed to extract PDF cover:', error);
    throw new Error(`Failed to extract cover image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get PDF metadata.
 *
 * @param pdfFile PDF file to analyze
 * @returns Promise resolving to PDF metadata
 */
export async function getPdfMetadata(pdfFile: File): Promise<PdfMetadata> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();

    return {
      numPages: pdf.numPages,
      title: metadata.info?.Title || pdfFile.name.replace(/\.pdf$/i, ''),
      author: metadata.info?.Author,
      creationDate: metadata.info?.CreationDate,
      fileSize: pdfFile.size,
    };
  } catch (error) {
    console.error('Failed to get PDF metadata:', error);
    throw new Error(`Failed to read PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Format file size in human-readable format.
 *
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "12.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
}

/**
 * Complete upload workflow for PDF resource file.
 * Handles hashing, cover extraction, and backend upload (no S3 APIs from client).
 *
 * @param pdfFile PDF file to upload
 * @param onProgress Progress callback
 * @returns Promise resolving to proxy URLs for PDF and cover
 */
export async function uploadResourceFiles(
  pdfFile: File,
  onProgress: (progress: UploadProgress) => void
): Promise<{ pdfUrl: string; coverUrl: string }> {

  try {
    // Stage 1: Hash PDF
    onProgress({
      stage: 'hashing',
      progress: 0,
      message: 'Computing file hash...',
    });

    const pdfHash = await computeFileHash(pdfFile);

    onProgress({
      stage: 'hashing',
      progress: 20,
      message: 'File hash computed',
    });

    // Stage 2: Extract cover
    onProgress({
      stage: 'extracting_cover',
      progress: 25,
      message: 'Extracting cover image from first page...',
    });

    const coverBlob = await extractPdfCover(pdfFile);

    onProgress({
      stage: 'extracting_cover',
      progress: 40,
      message: `Cover extracted (${formatFileSize(coverBlob.size)})`,
    });

    // Stage 3: Upload via backend (PDF + cover in one request)
    onProgress({
      stage: 'uploading_pdf',
      progress: 50,
      message: `Uploading to backend (${formatFileSize(pdfFile.size + coverBlob.size)})...`,
      bytesTotal: pdfFile.size + coverBlob.size,
    });

    const result = await uploadViaBackend(pdfHash, pdfFile, coverBlob);

    // Complete
    onProgress({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!',
    });

    return {
      pdfUrl: result.pdfUrl,
      coverUrl: result.coverUrl,
    };

  } catch (error) {
    console.error('Upload workflow error:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
