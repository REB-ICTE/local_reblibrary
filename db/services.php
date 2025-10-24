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
 * Web service definitions for the REB Library plugin.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [

    // Resources web services.
    'local_reblibrary_get_all_resources' => [
        'classname' => 'local_reblibrary\external\resources',
        'methodname' => 'get_all',
        'classpath' => '',
        'description' => 'Get all resources',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/reblibrary:view',
    ],

    'local_reblibrary_get_resource_by_id' => [
        'classname' => 'local_reblibrary\external\resources',
        'methodname' => 'get_by_id',
        'classpath' => '',
        'description' => 'Get resource by ID',
        'type' => 'read',
        'ajax' => true,
        'capabilities' => 'local/reblibrary:view',
    ],

    'local_reblibrary_create_resource' => [
        'classname' => 'local_reblibrary\external\resources',
        'methodname' => 'create',
        'classpath' => '',
        'description' => 'Create a new resource',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/reblibrary:manageresources',
    ],

    'local_reblibrary_update_resource' => [
        'classname' => 'local_reblibrary\external\resources',
        'methodname' => 'update',
        'classpath' => '',
        'description' => 'Update a resource',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/reblibrary:manageresources',
    ],

    'local_reblibrary_delete_resource' => [
        'classname' => 'local_reblibrary\external\resources',
        'methodname' => 'delete',
        'classpath' => '',
        'description' => 'Delete a resource',
        'type' => 'write',
        'ajax' => true,
        'capabilities' => 'local/reblibrary:manageresources',
    ],

];
