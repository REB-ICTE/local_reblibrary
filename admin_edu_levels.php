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
 * CRUD handler for education levels.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once($CFG->dirroot . '/local/reblibrary/classes/form/edu_level_form.php');

// Require login and admin capability.
require_login();
$context = context_system::instance();
require_capability('moodle/site:config', $context);

// Get parameters.
$action = optional_param('action', 'list', PARAM_ALPHA);
$id = optional_param('id', 0, PARAM_INT);

$PAGE->set_url(new moodle_url('/local/reblibrary/admin_edu_levels.php', ['action' => $action, 'id' => $id]));
$PAGE->set_context($context);
$PAGE->set_pagelayout('admin');
$PAGE->set_title(get_string('admin_edu_levels_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('admin_edu_levels_heading', 'local_reblibrary'));

global $DB;

// Handle delete action.
if ($action === 'delete' && $id > 0 && confirm_sesskey()) {
    $confirm = optional_param('confirm', 0, PARAM_INT);

    if ($confirm) {
        // Delete the record.
        $DB->delete_records('local_reblibrary_edu_levels', ['id' => $id]);
        redirect(
            new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']),
            get_string('success_deleted', 'local_reblibrary'),
            null,
            \core\output\notification::NOTIFY_SUCCESS
        );
    } else {
        // Show confirmation page.
        echo $OUTPUT->header();
        echo $OUTPUT->heading(get_string('confirm_delete', 'local_reblibrary'));

        $record = $DB->get_record('local_reblibrary_edu_levels', ['id' => $id], '*', MUST_EXIST);
        echo html_writer::tag('p', get_string('confirm_delete_level', 'local_reblibrary', $record->level_name));

        $confirmurl = new moodle_url('/local/reblibrary/admin_edu_levels.php', [
            'action' => 'delete',
            'id' => $id,
            'confirm' => 1,
            'sesskey' => sesskey(),
        ]);
        $cancelurl = new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']);

        echo $OUTPUT->confirm(
            get_string('areyousure'),
            $confirmurl,
            $cancelurl
        );

        echo $OUTPUT->footer();
        exit;
    }
}

// Handle add/edit actions.
if ($action === 'add' || $action === 'edit') {
    $record = null;

    if ($action === 'edit' && $id > 0) {
        $record = $DB->get_record('local_reblibrary_edu_levels', ['id' => $id], '*', MUST_EXIST);
    }

    // Create form instance.
    $mform = new \local_reblibrary\form\edu_level_form();

    if ($mform->is_cancelled()) {
        // Form cancelled, redirect back.
        redirect(new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']));
    } else if ($data = $mform->get_data()) {
        // Form submitted and validated.
        if (!empty($data->id)) {
            // Update existing record.
            $DB->update_record('local_reblibrary_edu_levels', $data);
            $message = get_string('success_updated', 'local_reblibrary');
        } else {
            // Insert new record.
            $DB->insert_record('local_reblibrary_edu_levels', $data);
            $message = get_string('success_created', 'local_reblibrary');
        }

        redirect(
            new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']),
            $message,
            null,
            \core\output\notification::NOTIFY_SUCCESS
        );
    } else {
        // Display form.
        if ($record) {
            $mform->set_data($record);
        }

        echo $OUTPUT->header();
        echo $OUTPUT->heading($action === 'add' ? get_string('form_add_level', 'local_reblibrary') : get_string('form_edit_level', 'local_reblibrary'));
        $mform->display();
        echo $OUTPUT->footer();
        exit;
    }
}

// Default: redirect to admin page.
redirect(new moodle_url('/local/reblibrary/admin.php', ['tab' => 'education']));
