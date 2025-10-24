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
 * External API for resources management.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_reblibrary\external;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');

use external_api;
use external_function_parameters;
use external_value;
use external_single_structure;
use external_multiple_structure;
use context_system;

/**
 * External API for resources CRUD operations.
 */
class resources extends external_api {

    /**
     * Returns description of get_all parameters.
     *
     * @return external_function_parameters
     */
    public static function get_all_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Get all resources.
     *
     * @return array List of resources
     */
    public static function get_all() {
        global $DB;

        // Validate context.
        $context = context_system::instance();
        self::validate_context($context);

        // Check capability.
        require_capability('local/reblibrary:view', $context);

        $resources = $DB->get_records('local_reblibrary_resources');

        $result = [];
        foreach ($resources as $resource) {
            $result[] = [
                'id' => $resource->id,
                'title' => $resource->title,
                'isbn' => $resource->isbn,
                'author_id' => $resource->author_id,
                'description' => $resource->description,
                'cover_image_url' => $resource->cover_image_url,
                'file_url' => $resource->file_url,
                'created_at' => $resource->created_at,
            ];
        }

        return $result;
    }

    /**
     * Returns description of get_all return value.
     *
     * @return external_multiple_structure
     */
    public static function get_all_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Resource ID'),
                'title' => new external_value(PARAM_TEXT, 'Resource title'),
                'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
                'author_id' => new external_value(PARAM_INT, 'Author ID'),
                'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
                'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
                'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
                'created_at' => new external_value(PARAM_INT, 'Creation timestamp'),
            ])
        );
    }

    /**
     * Returns description of get_by_id parameters.
     *
     * @return external_function_parameters
     */
    public static function get_by_id_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
        ]);
    }

    /**
     * Get resource by ID.
     *
     * @param int $id Resource ID
     * @return array Resource data
     */
    public static function get_by_id($id) {
        global $DB;

        // Validate parameters.
        $params = self::validate_parameters(self::get_by_id_parameters(), ['id' => $id]);

        // Validate context.
        $context = context_system::instance();
        self::validate_context($context);

        // Check capability.
        require_capability('local/reblibrary:view', $context);

        $resource = $DB->get_record('local_reblibrary_resources', ['id' => $params['id']], '*', MUST_EXIST);

        return [
            'id' => $resource->id,
            'title' => $resource->title,
            'isbn' => $resource->isbn,
            'author_id' => $resource->author_id,
            'description' => $resource->description,
            'cover_image_url' => $resource->cover_image_url,
            'file_url' => $resource->file_url,
            'created_at' => $resource->created_at,
        ];
    }

    /**
     * Returns description of get_by_id return value.
     *
     * @return external_single_structure
     */
    public static function get_by_id_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
            'title' => new external_value(PARAM_TEXT, 'Resource title'),
            'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
            'author_id' => new external_value(PARAM_INT, 'Author ID'),
            'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
            'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
            'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
            'created_at' => new external_value(PARAM_INT, 'Creation timestamp'),
        ]);
    }

    /**
     * Returns description of create parameters.
     *
     * @return external_function_parameters
     */
    public static function create_parameters() {
        return new external_function_parameters([
            'title' => new external_value(PARAM_TEXT, 'Resource title'),
            'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
            'author_id' => new external_value(PARAM_INT, 'Author ID'),
            'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
            'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
            'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Create a new resource.
     *
     * @param string $title
     * @param string $isbn
     * @param int $authorid
     * @param string $description
     * @param string $coverimageurl
     * @param string $fileurl
     * @return array Created resource
     */
    public static function create($title, $isbn = null, $authorid = 0, $description = null, $coverimageurl = null, $fileurl = null) {
        global $DB;

        // Validate parameters.
        $params = self::validate_parameters(self::create_parameters(), [
            'title' => $title,
            'isbn' => $isbn,
            'author_id' => $authorid,
            'description' => $description,
            'cover_image_url' => $coverimageurl,
            'file_url' => $fileurl,
        ]);

        // Validate context.
        $context = context_system::instance();
        self::validate_context($context);

        // Check capability.
        require_capability('local/reblibrary:manageresources', $context);

        $record = new \stdClass();
        $record->title = $params['title'];
        $record->isbn = $params['isbn'] ?? null;
        $record->author_id = $params['author_id'];
        $record->description = $params['description'] ?? null;
        $record->cover_image_url = $params['cover_image_url'] ?? null;
        $record->file_url = $params['file_url'] ?? null;
        $record->created_at = time();

        $id = $DB->insert_record('local_reblibrary_resources', $record);

        $resource = $DB->get_record('local_reblibrary_resources', ['id' => $id], '*', MUST_EXIST);

        return [
            'id' => $resource->id,
            'title' => $resource->title,
            'isbn' => $resource->isbn,
            'author_id' => $resource->author_id,
            'description' => $resource->description,
            'cover_image_url' => $resource->cover_image_url,
            'file_url' => $resource->file_url,
            'created_at' => $resource->created_at,
        ];
    }

    /**
     * Returns description of create return value.
     *
     * @return external_single_structure
     */
    public static function create_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
            'title' => new external_value(PARAM_TEXT, 'Resource title'),
            'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
            'author_id' => new external_value(PARAM_INT, 'Author ID'),
            'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
            'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
            'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
            'created_at' => new external_value(PARAM_INT, 'Creation timestamp'),
        ]);
    }

    /**
     * Returns description of update parameters.
     *
     * @return external_function_parameters
     */
    public static function update_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
            'title' => new external_value(PARAM_TEXT, 'Resource title', VALUE_OPTIONAL),
            'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
            'author_id' => new external_value(PARAM_INT, 'Author ID', VALUE_OPTIONAL),
            'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
            'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
            'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
        ]);
    }

    /**
     * Update a resource.
     *
     * @param int $id
     * @param string $title
     * @param string $isbn
     * @param int $authorid
     * @param string $description
     * @param string $coverimageurl
     * @param string $fileurl
     * @return array Updated resource
     */
    public static function update($id, $title = null, $isbn = null, $authorid = null, $description = null, $coverimageurl = null, $fileurl = null) {
        global $DB;

        // Validate parameters.
        $params = self::validate_parameters(self::update_parameters(), [
            'id' => $id,
            'title' => $title,
            'isbn' => $isbn,
            'author_id' => $authorid,
            'description' => $description,
            'cover_image_url' => $coverimageurl,
            'file_url' => $fileurl,
        ]);

        // Validate context.
        $context = context_system::instance();
        self::validate_context($context);

        // Check capability.
        require_capability('local/reblibrary:manageresources', $context);

        $resource = $DB->get_record('local_reblibrary_resources', ['id' => $params['id']], '*', MUST_EXIST);

        if (isset($params['title'])) {
            $resource->title = $params['title'];
        }
        if (isset($params['isbn'])) {
            $resource->isbn = $params['isbn'];
        }
        if (isset($params['author_id'])) {
            $resource->author_id = $params['author_id'];
        }
        if (isset($params['description'])) {
            $resource->description = $params['description'];
        }
        if (isset($params['cover_image_url'])) {
            $resource->cover_image_url = $params['cover_image_url'];
        }
        if (isset($params['file_url'])) {
            $resource->file_url = $params['file_url'];
        }

        $DB->update_record('local_reblibrary_resources', $resource);

        $updated = $DB->get_record('local_reblibrary_resources', ['id' => $params['id']], '*', MUST_EXIST);

        return [
            'id' => $updated->id,
            'title' => $updated->title,
            'isbn' => $updated->isbn,
            'author_id' => $updated->author_id,
            'description' => $updated->description,
            'cover_image_url' => $updated->cover_image_url,
            'file_url' => $updated->file_url,
            'created_at' => $updated->created_at,
        ];
    }

    /**
     * Returns description of update return value.
     *
     * @return external_single_structure
     */
    public static function update_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
            'title' => new external_value(PARAM_TEXT, 'Resource title'),
            'isbn' => new external_value(PARAM_TEXT, 'ISBN', VALUE_OPTIONAL),
            'author_id' => new external_value(PARAM_INT, 'Author ID'),
            'description' => new external_value(PARAM_RAW, 'Description', VALUE_OPTIONAL),
            'cover_image_url' => new external_value(PARAM_URL, 'Cover image URL', VALUE_OPTIONAL),
            'file_url' => new external_value(PARAM_URL, 'File URL', VALUE_OPTIONAL),
            'created_at' => new external_value(PARAM_INT, 'Creation timestamp'),
        ]);
    }

    /**
     * Returns description of delete parameters.
     *
     * @return external_function_parameters
     */
    public static function delete_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Resource ID'),
        ]);
    }

    /**
     * Delete a resource.
     *
     * @param int $id Resource ID
     * @return array Success status
     */
    public static function delete($id) {
        global $DB;

        // Validate parameters.
        $params = self::validate_parameters(self::delete_parameters(), ['id' => $id]);

        // Validate context.
        $context = context_system::instance();
        self::validate_context($context);

        // Check capability.
        require_capability('local/reblibrary:manageresources', $context);

        $DB->delete_records('local_reblibrary_resources', ['id' => $params['id']]);

        return ['success' => true];
    }

    /**
     * Returns description of delete return value.
     *
     * @return external_single_structure
     */
    public static function delete_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success status'),
        ]);
    }
}
