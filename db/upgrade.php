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
 * Database upgrade script for local_reblibrary.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Upgrade the local_reblibrary plugin.
 *
 * @param int $oldversion The version number of the plugin that was installed.
 * @return bool Always returns true.
 */
function xmldb_local_reblibrary_upgrade($oldversion) {
    global $DB;

    $dbman = $DB->get_manager();

    // Add visibility and media_type fields to resources, visibility to categories, and create labels tables.
    if ($oldversion < 2025102503) {

        // Define field visible to be added to local_reblibrary_resources.
        $table = new xmldb_table('local_reblibrary_resources');
        $field = new xmldb_field('visible', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1', 'author_id');

        // Conditionally launch add field visible.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Define index visible (not unique) to be added to local_reblibrary_resources.
        $index = new xmldb_index('visible', XMLDB_INDEX_NOTUNIQUE, ['visible']);

        // Conditionally launch add index visible.
        if (!$dbman->index_exists($table, $index)) {
            $dbman->add_index($table, $index);
        }

        // Define field media_type to be added to local_reblibrary_resources.
        $field = new xmldb_field('media_type', XMLDB_TYPE_CHAR, '10', null, XMLDB_NOTNULL, null, 'text', 'visible');

        // Conditionally launch add field media_type.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Define index media_type (not unique) to be added to local_reblibrary_resources.
        $index = new xmldb_index('media_type', XMLDB_INDEX_NOTUNIQUE, ['media_type']);

        // Conditionally launch add index media_type.
        if (!$dbman->index_exists($table, $index)) {
            $dbman->add_index($table, $index);
        }

        // Define field visible to be added to local_reblibrary_categories.
        $table = new xmldb_table('local_reblibrary_categories');
        $field = new xmldb_field('visible', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1', 'description');

        // Conditionally launch add field visible.
        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Define index visible (not unique) to be added to local_reblibrary_categories.
        $index = new xmldb_index('visible', XMLDB_INDEX_NOTUNIQUE, ['visible']);

        // Conditionally launch add index visible.
        if (!$dbman->index_exists($table, $index)) {
            $dbman->add_index($table, $index);
        }

        // Define table local_reblibrary_labels to be created.
        $table = new xmldb_table('local_reblibrary_labels');

        // Adding fields to table local_reblibrary_labels.
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('label_name', XMLDB_TYPE_CHAR, '100', null, XMLDB_NOTNULL, null, null);
        $table->add_field('description', XMLDB_TYPE_TEXT, null, null, null, null, null);

        // Adding keys to table local_reblibrary_labels.
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);

        // Adding indexes to table local_reblibrary_labels.
        $table->add_index('label_name', XMLDB_INDEX_UNIQUE, ['label_name']);

        // Conditionally launch create table for local_reblibrary_labels.
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        // Define table local_reblibrary_res_labels to be created.
        $table = new xmldb_table('local_reblibrary_res_labels');

        // Adding fields to table local_reblibrary_res_labels.
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('resource_id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('label_id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);

        // Adding keys to table local_reblibrary_res_labels.
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('resource_id', XMLDB_KEY_FOREIGN, ['resource_id'], 'local_reblibrary_resources', ['id']);
        $table->add_key('label_id', XMLDB_KEY_FOREIGN, ['label_id'], 'local_reblibrary_labels', ['id']);
        $table->add_key('resource_label', XMLDB_KEY_UNIQUE, ['resource_id', 'label_id']);

        // Adding indexes to table local_reblibrary_res_labels.
        $table->add_index('resource_idx', XMLDB_INDEX_NOTUNIQUE, ['resource_id']);
        $table->add_index('label_idx', XMLDB_INDEX_NOTUNIQUE, ['label_id']);

        // Conditionally launch create table for local_reblibrary_res_labels.
        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        // Reblibrary savepoint reached.
        upgrade_plugin_savepoint(true, 2025102503, 'local', 'reblibrary');
    }

    return true;
}
