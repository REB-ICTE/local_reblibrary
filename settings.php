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

    // MinIO S3 Storage Settings.
    $settings->add(new admin_setting_heading(
        'local_reblibrary/minioheading',
        get_string('miniosettings', 'local_reblibrary'),
        get_string('miniosettings_desc', 'local_reblibrary')
    ));

    $settings->add(new admin_setting_configtext(
        'local_reblibrary/minio_endpoint',
        get_string('minioendpoint', 'local_reblibrary'),
        get_string('minioendpoint_desc', 'local_reblibrary'),
        'http://minio:9000',
        PARAM_URL
    ));

    $settings->add(new admin_setting_configtext(
        'local_reblibrary/minio_public_endpoint',
        get_string('miniopublicendpoint', 'local_reblibrary'),
        get_string('miniopublicendpoint_desc', 'local_reblibrary'),
        'http://localhost:9000',
        PARAM_URL
    ));

    $settings->add(new admin_setting_configtext(
        'local_reblibrary/minio_access_key',
        get_string('minioaccesskey', 'local_reblibrary'),
        get_string('minioaccesskey_desc', 'local_reblibrary'),
        'minioadmin',
        PARAM_TEXT
    ));

    $settings->add(new admin_setting_configpasswordunmask(
        'local_reblibrary/minio_secret_key',
        get_string('miniosecretkey', 'local_reblibrary'),
        get_string('miniosecretkey_desc', 'local_reblibrary'),
        'minioadmin'
    ));

    $settings->add(new admin_setting_configtext(
        'local_reblibrary/minio_bucket',
        get_string('miniobucket', 'local_reblibrary'),
        get_string('miniobucket_desc', 'local_reblibrary'),
        'moodle',
        PARAM_TEXT
    ));

    $settings->add(new admin_setting_configtext(
        'local_reblibrary/minio_region',
        get_string('minioregion', 'local_reblibrary'),
        get_string('minioregion_desc', 'local_reblibrary'),
        'us-east-1',
        PARAM_TEXT
    ));
}
