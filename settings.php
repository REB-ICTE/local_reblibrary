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
 * Settings for local_reblibrary.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    // Create the settings page for this plugin.
    $settings = new admin_settingpage('local_reblibrary', get_string('pluginname', 'local_reblibrary'));

    // Add this page to the admin menu.
    $ADMIN->add('localplugins', $settings);

    // Add your settings here.
    // Example:
    // $settings->add(new admin_setting_configtext(
    //     'local_reblibrary/example',
    //     get_string('example', 'local_reblibrary'),
    //     get_string('example_desc', 'local_reblibrary'),
    //     'default value'
    // ));
}
