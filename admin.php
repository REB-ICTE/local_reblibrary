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
 * REB Library administration page.
 *
 * This page is accessible only to users with system-level admin capabilities.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');

// Require login and admin capability.
require_login();

// Set up the page context.
$context = context_system::instance();
$PAGE->set_context($context);

// Check for admin capability - only site admins can access.
require_capability('moodle/site:config', $context);

// Get the active tab parameter.
$activetab = optional_param('tab', 'dashboard', PARAM_ALPHA);

$PAGE->set_url(new moodle_url('/local/reblibrary/admin.php', ['tab' => $activetab]));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('adminpage_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('adminpage_heading', 'local_reblibrary'));

// Load custom CSS.
$PAGE->requires->css('/local/reblibrary/styles.css');

// Add breadcrumb navigation.
$PAGE->navbar->add(get_string('pluginname', 'local_reblibrary'));
$PAGE->navbar->add(get_string('adminpage_title', 'local_reblibrary'));

// Prepare header data.
$headercontext = [
    'logo_text' => get_string('header_logo', 'local_reblibrary'),
    'search_placeholder' => get_string('header_search_placeholder', 'local_reblibrary'),
    'user_fullname' => fullname($USER),
    'user_picture_url' => $OUTPUT->get_generated_image_for_id($USER->id),
    'user_initials' => strtoupper(substr($USER->firstname, 0, 1) . substr($USER->lastname, 0, 1)),
];

// Prepare sidebar navigation data for admin.
$sidebarcontext = [
    'admin_menu_heading' => get_string('admin_menu_heading', 'local_reblibrary'),
    'admin_menu_items' => [
        [
            'name' => get_string('admin_nav_dashboard', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/admin.php', ['tab' => 'dashboard']),
            'icon' => 'fa fa-tachometer-alt',
            'active' => ($activetab === 'dashboard'),
        ],
        [
            'name' => get_string('admin_nav_education', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']),
            'icon' => 'fa fa-graduation-cap',
            'active' => ($activetab === 'education'),
        ],
        [
            'name' => get_string('admin_nav_resources', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/admin.php', ['tab' => 'resources']),
            'icon' => 'fa fa-book',
            'active' => ($activetab === 'resources'),
        ],
        [
            'name' => get_string('admin_nav_categories', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/admin.php', ['tab' => 'categories']),
            'icon' => 'fa fa-tags',
            'active' => ($activetab === 'categories'),
        ],
        [
            'name' => get_string('admin_nav_assignments', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/admin.php', ['tab' => 'assignments']),
            'icon' => 'fa fa-link',
            'active' => ($activetab === 'assignments'),
        ],
    ],
    'library_menu_heading' => get_string('sidebar_browse', 'local_reblibrary'),
    'library_menu_items' => [
        [
            'name' => get_string('nav_home', 'local_reblibrary'),
            'url' => new moodle_url('/local/reblibrary/index.php'),
            'icon' => 'fa fa-home',
            'active' => false,
        ],
    ],
];

// Fetch data for each tab.
global $DB;

// Dashboard stats.
$stats = [
    'total_resources' => $DB->count_records('local_reblibrary_resources'),
    'total_authors' => $DB->count_records('local_reblibrary_authors'),
    'total_categories' => $DB->count_records('local_reblibrary_categories'),
    'total_classes' => $DB->count_records('local_reblibrary_classes'),
];

// Fetch education structure data.
$edulevels = $DB->get_records('local_reblibrary_edu_levels', null, 'level_name ASC');
$edusublevels = $DB->get_records('local_reblibrary_edu_sublevels', null, 'sublevel_name ASC');
$classes = $DB->get_records('local_reblibrary_classes', null, 'class_code ASC');
$sections = $DB->get_records('local_reblibrary_sections', null, 'section_code ASC');

// Fetch content data.
$authors = $DB->get_records('local_reblibrary_authors', null, 'last_name ASC, first_name ASC');
$resources = $DB->get_records('local_reblibrary_resources', null, 'created_at DESC');
$categories = $DB->get_records('local_reblibrary_categories', null, 'category_name ASC');

// Prepare data for template.
$templatecontext = [
    'header' => $headercontext,
    'sidebar' => $sidebarcontext,
    'active_tab' => $activetab,
    'tab_dashboard' => ($activetab === 'dashboard'),
    'tab_education' => ($activetab === 'education'),
    'tab_resources' => ($activetab === 'resources'),
    'tab_categories' => ($activetab === 'categories'),
    'tab_assignments' => ($activetab === 'assignments'),
    'stats' => $stats,
    'edu_levels' => array_values($edulevels),
    'edu_sublevels' => array_values($edusublevels),
    'classes' => array_values($classes),
    'sections' => array_values($sections),
    'authors' => array_values($authors),
    'resources' => array_values($resources),
    'categories' => array_values($categories),
    'has_edu_levels' => !empty($edulevels),
    'has_edu_sublevels' => !empty($edusublevels),
    'has_classes' => !empty($classes),
    'has_sections' => !empty($sections),
    'has_authors' => !empty($authors),
    'has_resources' => !empty($resources),
    'has_categories' => !empty($categories),
];

// Output the page.
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reblibrary/header', $headercontext);
echo $OUTPUT->render_from_template('local_reblibrary/admin_page', $templatecontext);
echo $OUTPUT->footer();
