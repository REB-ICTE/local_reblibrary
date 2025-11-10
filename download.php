<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * File download proxy for REB Library resources.
 *
 * Streams files from MinIO storage to browser with proper headers.
 * Supports HTTP range requests for PDF streaming.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../config.php');
require_once($CFG->dirroot . '/local/reblibrary/classes/minio_client.php');

use local_reblibrary\minio_client;

// Require login and check capability.
require_login();

$context = context_system::instance();
require_capability('local/reblibrary:view', $context);

// Get file key parameter.
$key = required_param('key', PARAM_TEXT);

// Validate key format (must start with 'resources/').
if (strpos($key, 'resources/') !== 0) {
    print_error('invalidfilekey', 'local_reblibrary');
}

try {
    // Initialize MinIO client.
    $minio = new minio_client();

    // Get S3 client using reflection (access private property).
    $reflection = new ReflectionClass($minio);
    $property = $reflection->getProperty('s3client');
    $property->setAccessible(true);
    $s3client = $property->getValue($minio);

    // Get object metadata.
    try {
        $result = $s3client->headObject([
            'Bucket' => $minio->get_bucket(),
            'Key' => $key,
        ]);
    } catch (Aws\S3\Exception\S3Exception $e) {
        if ($e->getStatusCode() === 404) {
            print_error('filenotfound', 'local_reblibrary');
        }
        throw $e;
    }

    $contentlength = $result['ContentLength'];
    $contenttype = $result['ContentType'];
    $etag = $result['ETag'];

    // Determine filename from key.
    $filename = basename($key);

    // Check for Range header (HTTP range request).
    $rangeheader = isset($_SERVER['HTTP_RANGE']) ? $_SERVER['HTTP_RANGE'] : null;
    $rangestart = 0;
    $rangeend = $contentlength - 1;
    $ispartial = false;

    if ($rangeheader) {
        // Parse Range header (e.g., "bytes=0-1023").
        if (preg_match('/bytes=(\d+)-(\d*)/', $rangeheader, $matches)) {
            $rangestart = intval($matches[1]);
            $rangeend = !empty($matches[2]) ? intval($matches[2]) : $contentlength - 1;
            $ispartial = true;

            // Validate range.
            if ($rangestart > $rangeend || $rangestart >= $contentlength) {
                header('HTTP/1.1 416 Requested Range Not Satisfiable');
                header('Content-Range: bytes */' . $contentlength);
                exit;
            }
        }
    }

    // Set appropriate HTTP status code.
    if ($ispartial) {
        header('HTTP/1.1 206 Partial Content');
        header('Content-Range: bytes ' . $rangestart . '-' . $rangeend . '/' . $contentlength);
        $outputlength = $rangeend - $rangestart + 1;
    } else {
        header('HTTP/1.1 200 OK');
        $outputlength = $contentlength;
    }

    // Set headers.
    header('Content-Type: ' . $contenttype);
    header('Content-Length: ' . $outputlength);
    header('Accept-Ranges: bytes');
    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=31536000'); // Cache for 1 year.

    // For PDF files, display inline. For images, also inline.
    if ($contenttype === 'application/pdf' || strpos($contenttype, 'image/') === 0) {
        header('Content-Disposition: inline; filename="' . $filename . '"');
    } else {
        header('Content-Disposition: attachment; filename="' . $filename . '"');
    }

    // Stream file from MinIO.
    $getoptions = [
        'Bucket' => $minio->get_bucket(),
        'Key' => $key,
    ];

    // Add Range if partial content.
    if ($ispartial) {
        $getoptions['Range'] = 'bytes=' . $rangestart . '-' . $rangeend;
    }

    $object = $s3client->getObject($getoptions);

    // Stream body to output.
    $body = $object['Body'];

    // For large files, stream in chunks.
    if ($body->isSeekable()) {
        while (!$body->eof()) {
            echo $body->read(8192); // 8KB chunks.
            flush();
        }
    } else {
        echo $body->getContents();
    }

    exit;

} catch (Exception $e) {
    debugging('MinIO download error: ' . $e->getMessage(), DEBUG_DEVELOPER);
    print_error('downloaderror', 'local_reblibrary');
}
