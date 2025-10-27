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
 * Upload URLs response from backend
 */
export interface UploadUrls {
  pdf_hash: string;
  pdf_exists: boolean;
  pdf_upload_url?: string;
  pdf_public_url: string;
  cover_upload_url: string;
  cover_public_url: string;
  expires_in: number;
}

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
 * Request upload URLs from backend.
 *
 * @param pdfHash SHA-256 hash of PDF file
 * @returns Promise resolving to upload URLs
 */
export async function requestUploadUrls(pdfHash: string): Promise<UploadUrls> {
  return new Promise((resolve, reject) => {
    require(['core/ajax'], (ajax: any) => {
      ajax.call([{
        methodname: 'local_reblibrary_generate_upload_urls',
        args: { pdf_hash: pdfHash }
      }])[0]
        .then((data: UploadUrls) => resolve(data))
        .catch((error: any) => {
          console.error('Failed to request upload URLs:', error);
          reject(new Error(error.message || 'Failed to generate upload URLs'));
        });
    });
  });
}

/**
 * Upload file to MinIO using presigned URL.
 *
 * @param file File or Blob to upload
 * @param presignedUrl Presigned PUT URL from backend
 * @param contentType MIME type of the file
 * @param onProgress Progress callback (percentage 0-100)
 * @returns Promise that resolves when upload completes
 */
export async function uploadToMinIO(
  file: File | Blob,
  presignedUrl: string,
  contentType: string,
  onProgress?: (progress: number, bytesUploaded: number, bytesTotal: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress(percentage, e.loaded, e.total);
      }
    });

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled by user'));
    });

    // Perform upload
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(file);
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
 * Handles hashing, deduplication check, upload, and cover extraction.
 *
 * @param pdfFile PDF file to upload
 * @param onProgress Progress callback
 * @returns Promise resolving to public URLs for PDF and cover
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
      progress: 15,
      message: 'File hash computed',
    });

    // Stage 2: Request URLs
    onProgress({
      stage: 'requesting_urls',
      progress: 20,
      message: 'Requesting upload URLs...',
    });

    const urls = await requestUploadUrls(pdfHash);

    // Stage 3: Upload PDF (if needed)
    if (!urls.pdf_exists && urls.pdf_upload_url) {
      onProgress({
        stage: 'uploading_pdf',
        progress: 30,
        message: `Uploading PDF (${formatFileSize(pdfFile.size)})...`,
        bytesTotal: pdfFile.size,
      });

      await uploadToMinIO(
        pdfFile,
        urls.pdf_upload_url,
        'application/pdf',
        (percentage, uploaded, total) => {
          onProgress({
            stage: 'uploading_pdf',
            progress: 30 + (percentage * 0.3), // 30-60%
            message: `Uploading PDF... ${percentage}%`,
            bytesUploaded: uploaded,
            bytesTotal: total,
          });
        }
      );

      onProgress({
        stage: 'uploading_pdf',
        progress: 60,
        message: 'PDF uploaded successfully',
      });
    } else {
      onProgress({
        stage: 'uploading_pdf',
        progress: 60,
        message: 'PDF already exists in storage (skipped upload)',
      });
    }

    // Stage 4: Extract cover
    onProgress({
      stage: 'extracting_cover',
      progress: 65,
      message: 'Extracting cover image from first page...',
    });

    const coverBlob = await extractPdfCover(pdfFile);

    onProgress({
      stage: 'extracting_cover',
      progress: 75,
      message: `Cover extracted (${formatFileSize(coverBlob.size)})`,
    });

    // Stage 5: Upload cover
    onProgress({
      stage: 'uploading_cover',
      progress: 80,
      message: 'Uploading cover image...',
      bytesTotal: coverBlob.size,
    });

    await uploadToMinIO(
      coverBlob,
      urls.cover_upload_url,
      'image/jpeg',
      (percentage, uploaded, total) => {
        onProgress({
          stage: 'uploading_cover',
          progress: 80 + (percentage * 0.2), // 80-100%
          message: `Uploading cover... ${percentage}%`,
          bytesUploaded: uploaded,
          bytesTotal: total,
        });
      }
    );

    // Complete
    onProgress({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!',
    });

    return {
      pdfUrl: urls.pdf_public_url,
      coverUrl: urls.cover_public_url,
    };

  } catch (error) {
    console.error('Upload workflow error:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
