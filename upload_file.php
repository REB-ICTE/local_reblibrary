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
 * File upload endpoint for REB Library resources.
 *
 * Accepts multipart file uploads (PDF + cover image) and stores them in S3.
 * This avoids the base64-over-AJAX approach which cannot handle large files.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require_once(__DIR__ . '/../../../config.php');

require_login();
require_sesskey();

$context = context_system::instance();
require_capability('local/reblibrary:manageresources', $context);

header('Content-Type: application/json; charset=utf-8');

try {
    // Validate request method.
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new moodle_exception('invalidrequest', 'error', '', null, 'POST method required');
    }

    // Get and validate PDF hash.
    $pdfhash = required_param('pdf_hash', PARAM_ALPHANUM);
    if (!preg_match('/^[a-f0-9]{64}$/i', $pdfhash)) {
        throw new invalid_parameter_exception('Invalid PDF hash format. Expected SHA-256 (64 hex characters).');
    }

    // Validate uploaded files.
    if (empty($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
        $errorcode = $_FILES['pdf']['error'] ?? -1;
        $errormsg = match ($errorcode) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File exceeds maximum upload size',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary upload directory',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            default => 'File upload error (code: ' . $errorcode . ')',
        };
        throw new moodle_exception('uploadfailed', 'local_reblibrary', '', null, $errormsg);
    }

    if (empty($_FILES['cover']) || $_FILES['cover']['error'] !== UPLOAD_ERR_OK) {
        throw new moodle_exception('uploadfailed', 'local_reblibrary', '', null, 'Cover image upload failed');
    }

    $pdftmppath = $_FILES['pdf']['tmp_name'];
    $covertmppath = $_FILES['cover']['tmp_name'];
    $pdfsize = $_FILES['pdf']['size'];
    $coversize = $_FILES['cover']['size'];

    // Validate file sizes.
    if ($pdfsize > 100 * 1024 * 1024) {
        throw new invalid_parameter_exception('PDF file exceeds 100MB limit');
    }
    if ($coversize > 10 * 1024 * 1024) {
        throw new invalid_parameter_exception('Cover image exceeds 10MB limit');
    }

    // Verify PDF hash matches uploaded file content.
    $computedhash = hash_file('sha256', $pdftmppath);
    if ($computedhash !== strtolower($pdfhash)) {
        throw new invalid_parameter_exception('PDF hash mismatch. Computed: ' . $computedhash);
    }

    // Initialize S3 client.
    $s3 = new local_reblibrary\s3_client();

    // Use reflection to access the underlying AWS S3 client.
    $reflection = new ReflectionClass($s3);
    $property = $reflection->getProperty('s3client');
    $property->setAccessible(true);
    $awsclient = $property->getValue($s3);

    // PDF path: content-addressed by hash.
    $pdfkey = 'resources/' . $pdfhash . '/file.pdf';

    // Check if PDF already exists (deduplication).
    $pdfexists = $s3->object_exists($pdfkey);

    // Upload PDF only if it doesn't exist.
    if (!$pdfexists) {
        $awsclient->putObject([
            'Bucket' => $s3->get_bucket(),
            'Key' => $pdfkey,
            'SourceFile' => $pdftmppath,
            'ContentType' => 'application/pdf',
            'ACL' => 'public-read',
        ]);
    }

    // Cover path: unique per upload (UUID v4).
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    $coveruuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));

    $coverkey = 'resources/' . $pdfhash . '/covers/' . $coveruuid . '.jpg';

    // Upload cover image.
    $awsclient->putObject([
        'Bucket' => $s3->get_bucket(),
        'Key' => $coverkey,
        'SourceFile' => $covertmppath,
        'ContentType' => 'image/jpeg',
        'ACL' => 'public-read',
    ]);

    // Generate proxy URLs.
    $pdfurl = $CFG->wwwroot . '/local/reblibrary/download.php?key=' . urlencode($pdfkey);
    $coverurl = $CFG->wwwroot . '/local/reblibrary/download.php?key=' . urlencode($coverkey);

    echo json_encode([
        'success' => true,
        'pdf_hash' => $pdfhash,
        'pdf_exists' => $pdfexists,
        'pdf_key' => $pdfkey,
        'pdf_url' => $pdfurl,
        'cover_key' => $coverkey,
        'cover_url' => $coverurl,
        'pdf_size' => $pdfsize,
        'cover_size' => $coversize,
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
