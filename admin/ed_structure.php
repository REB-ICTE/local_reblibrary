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
 * Education structure management page.
 *
 * This page is accessible only to users with system-level admin capabilities.
 * It provides a Preact-based interface for managing education levels, sublevels,
 * classes, and sections.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../config.php');

// Require login and admin capability.
require_login();

// Set up the page context.
$context = context_system::instance();
$PAGE->set_context($context);

// Check for admin capability - only site admins can access.
require_capability('moodle/site:config', $context);

$PAGE->set_url(new moodle_url('/local/reblibrary/admin/ed_structure.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('ed_structure_page_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('ed_structure_page_heading', 'local_reblibrary'));

// Add body classes for plugin-specific page styling.
$PAGE->add_body_class('local-reblibrary-plugin');
$PAGE->add_body_class('local-reblibrary-admin-page');
$PAGE->add_body_class('local-reblibrary-ed-structure');

// Load custom CSS.
$PAGE->requires->css('/local/reblibrary/styles.css');

// Load custom JavaScript module.
$PAGE->requires->js_call_amd('local_reblibrary/ed-structure', 'init');

// Add breadcrumb navigation.
$PAGE->navbar->add(get_string('pluginname', 'local_reblibrary'));
$PAGE->navbar->add(get_string('ed_structure_page_title', 'local_reblibrary'));

// Fetch education structure data from database.
global $DB;

// Levels.
$levels = $DB->get_records('local_reblibrary_edu_levels', null, 'level_name ASC');
$levelsdata = [];
foreach ($levels as $level) {
    $levelsdata[] = [
        'id' => $level->id,
        'level_name' => $level->level_name,
    ];
}

// Sublevels.
$sublevels = $DB->get_records('local_reblibrary_edu_sublevels', null, 'sublevel_name ASC');
$sublevelsdata = [];
foreach ($sublevels as $sublevel) {
    $sublevelsdata[] = [
        'id' => $sublevel->id,
        'sublevel_name' => $sublevel->sublevel_name,
        'level_id' => $sublevel->level_id,
    ];
}

// Classes.
$classes = $DB->get_records('local_reblibrary_classes', null, 'class_code ASC');
$classesdata = [];
foreach ($classes as $class) {
    $classesdata[] = [
        'id' => $class->id,
        'class_name' => $class->class_name,
        'class_code' => $class->class_code,
        'sublevel_id' => $class->sublevel_id,
    ];
}

// Sections.
$sections = $DB->get_records('local_reblibrary_sections', null, 'section_code ASC');
$sectionsdata = [];
foreach ($sections as $section) {
    $sectionsdata[] = [
        'id' => $section->id,
        'section_name' => $section->section_name,
        'section_code' => $section->section_code,
        'sublevel_id' => $section->sublevel_id,
    ];
}

// Prepare data for template (only JSON-encoded data for Preact).
$templatecontext = [
    'levels_json' => json_encode($levelsdata, JSON_HEX_QUOT | JSON_HEX_APOS),
    'sublevels_json' => json_encode($sublevelsdata, JSON_HEX_QUOT | JSON_HEX_APOS),
    'classes_json' => json_encode($classesdata, JSON_HEX_QUOT | JSON_HEX_APOS),
    'sections_json' => json_encode($sectionsdata, JSON_HEX_QUOT | JSON_HEX_APOS),
];

// Output the page.
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reblibrary/admin_ed_structure', $templatecontext);
echo $OUTPUT->footer();
