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

    // For future database upgrades, add version checks here.
    // Example:
    // if ($oldversion < 2025101601) {
    //     // Upgrade steps for version 2025101601.
    //     upgrade_plugin_savepoint(true, 2025101601, 'local', 'reblibrary');
    // }

    return true;
}
