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
 * REB Library admin dashboard.
 *
 * This page displays the admin dashboard accessible only to users
 * with system-level admin capabilities.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../config.php');
require_once($CFG->dirroot . '/local/reblibrary/lib.php');

// Require login and admin capability.
require_login();

// Set up the page context.
$context = context_system::instance();
$PAGE->set_context($context);

// Check for admin capability - only site admins can access.
require_capability('moodle/site:config', $context);

$PAGE->set_url(new moodle_url('/local/reblibrary/admin/index.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('adminpage_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('adminpage_heading', 'local_reblibrary'));

// Add body classes for plugin-specific page styling.
$PAGE->add_body_class('local-reblibrary-plugin');
$PAGE->add_body_class('local-reblibrary-admin-page');

// Load custom CSS.
$PAGE->requires->css('/local/reblibrary/styles.css');

// Load custom JavaScript module.
$PAGE->requires->js_call_amd('local_reblibrary/dashboard', 'init');

// Add breadcrumb navigation.
$PAGE->navbar->add(get_string('pluginname', 'local_reblibrary'));
$PAGE->navbar->add(get_string('admin_nav_dashboard', 'local_reblibrary'));

// Prepare user data for Preact (via data attributes).
$userroles = [];
foreach (get_user_roles($context, $USER->id) as $role) {
    $userroles[] = $role->shortname;
}

$userdata = [
    'id' => $USER->id,
    'fullname' => fullname($USER),
    'firstname' => $USER->firstname,
    'lastname' => $USER->lastname,
    'email' => $USER->email,
    'avatar' => $OUTPUT->get_generated_image_for_id($USER->id),
    'roles' => $userroles,
];

// Prepare stats data for Preact (via data attributes).
// TODO: Replace with real database queries.
$statsdata = [
    'totalResources' => $DB->count_records('local_reblibrary_resources'),
    'totalAuthors' => $DB->count_records('local_reblibrary_authors'),
    'totalCategories' => $DB->count_records('local_reblibrary_categories'),
    'totalClasses' => $DB->count_records('local_reblibrary_classes'),
];

// Prepare data for template (only JSON-encoded data for Preact).
$templatecontext = [
    'user_data_json' => json_encode($userdata, JSON_HEX_QUOT | JSON_HEX_APOS),
    'stats_data_json' => json_encode($statsdata, JSON_HEX_QUOT | JSON_HEX_APOS),
];

// Output the page.
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reblibrary/root', $templatecontext);
echo $OUTPUT->footer();
