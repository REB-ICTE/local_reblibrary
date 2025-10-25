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
 * REB Library home page - Public library with all available books.
 *
 * This page displays all available resources in a book grid format,
 * accessible to both authenticated users and guests.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');

// Allow both authenticated users and guests to access this page.
require_login(null, true);

// Set up the page context.
$context = context_system::instance();
$PAGE->set_context($context);
$PAGE->set_url(new moodle_url('/local/reblibrary/index.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('librarypage_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('librarypage_heading', 'local_reblibrary'));

// Add body classes for styling.
$PAGE->add_body_class('local-reblibrary-plugin');
$PAGE->add_body_class('local-reblibrary-home');

// Load custom CSS.
$PAGE->requires->css('/local/reblibrary/styles.css');

// Load JavaScript module for library home.
$PAGE->requires->js_call_amd('local_reblibrary/library-home', 'init');

// Fetch all resources from database with author information.
global $DB;

$sql = "SELECT r.id, r.title, r.isbn, r.description, r.file_url, r.cover_image_url,
               r.author_id, r.created_at,
               CONCAT(a.first_name, ' ', a.last_name) as author_name,
               a.first_name, a.last_name
        FROM {local_reblibrary_resources} r
        LEFT JOIN {local_reblibrary_authors} a ON r.author_id = a.id
        ORDER BY r.created_at DESC";

$resources = $DB->get_records_sql($sql);
$resourcesdata = [];
foreach ($resources as $resource) {
    $resourcesdata[] = [
        'id' => $resource->id,
        'title' => $resource->title,
        'isbn' => $resource->isbn ?? '',
        'description' => $resource->description ?? '',
        'file_url' => $resource->file_url ?? '',
        'cover_image_url' => $resource->cover_image_url ?? '',
        'author_id' => $resource->author_id,
        'author_name' => $resource->author_name ?? 'Unknown',
        'created_at' => $resource->created_at,
    ];
}

// Get all categories for filtering.
$categories = $DB->get_records('local_reblibrary_categories', null, 'category_name ASC');
$categoriesdata = [];
foreach ($categories as $category) {
    $categoriesdata[] = [
        'id' => $category->id,
        'category_name' => $category->category_name,
        'parent_category_id' => $category->parent_category_id,
        'description' => $category->description ?? '',
    ];
}

// Prepare data for template.
$templatecontext = [
    'resources_json' => json_encode($resourcesdata, JSON_HEX_QUOT | JSON_HEX_APOS),
    'categories_json' => json_encode($categoriesdata, JSON_HEX_QUOT | JSON_HEX_APOS),
];

// Output the page.
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reblibrary/library_home', $templatecontext);
echo $OUTPUT->footer();
