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
 * External API for education structure management.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
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
 * External API for education structure CRUD operations.
 */
class edu_structure extends external_api {

    // ============================================
    // EDUCATION LEVELS
    // ============================================

    /**
     * Returns description of get_all_levels parameters.
     */
    public static function get_all_levels_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Get all education levels.
     */
    public static function get_all_levels() {
        global $DB;

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $levels = $DB->get_records('local_reblibrary_edu_levels', null, 'level_name ASC');

        $result = [];
        foreach ($levels as $level) {
            $result[] = [
                'id' => $level->id,
                'level_name' => $level->level_name,
            ];
        }

        return $result;
    }

    /**
     * Returns description of get_all_levels return value.
     */
    public static function get_all_levels_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Level ID'),
                'level_name' => new external_value(PARAM_TEXT, 'Level name'),
            ])
        );
    }

    /**
     * Returns description of create_level parameters.
     */
    public static function create_level_parameters() {
        return new external_function_parameters([
            'level_name' => new external_value(PARAM_TEXT, 'Level name'),
        ]);
    }

    /**
     * Create a new education level.
     */
    public static function create_level($levelname) {
        global $DB;

        $params = self::validate_parameters(self::create_level_parameters(), [
            'level_name' => $levelname,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        // Check for duplicate.
        if ($DB->record_exists('local_reblibrary_edu_levels', ['level_name' => $params['level_name']])) {
            throw new \moodle_exception('error_duplicate_level_name', 'local_reblibrary');
        }

        $record = new \stdClass();
        $record->level_name = $params['level_name'];

        $id = $DB->insert_record('local_reblibrary_edu_levels', $record);

        $level = $DB->get_record('local_reblibrary_edu_levels', ['id' => $id], '*', MUST_EXIST);

        return [
            'id' => $level->id,
            'level_name' => $level->level_name,
        ];
    }

    /**
     * Returns description of create_level return value.
     */
    public static function create_level_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Level ID'),
            'level_name' => new external_value(PARAM_TEXT, 'Level name'),
        ]);
    }

    /**
     * Returns description of update_level parameters.
     */
    public static function update_level_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Level ID'),
            'level_name' => new external_value(PARAM_TEXT, 'Level name'),
        ]);
    }

    /**
     * Update an education level.
     */
    public static function update_level($id, $levelname) {
        global $DB;

        $params = self::validate_parameters(self::update_level_parameters(), [
            'id' => $id,
            'level_name' => $levelname,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $level = $DB->get_record('local_reblibrary_edu_levels', ['id' => $params['id']], '*', MUST_EXIST);

        // Check for duplicate (excluding current record).
        if ($DB->record_exists_sql(
            "SELECT id FROM {local_reblibrary_edu_levels} WHERE level_name = ? AND id != ?",
            [$params['level_name'], $params['id']]
        )) {
            throw new \moodle_exception('error_duplicate_level_name', 'local_reblibrary');
        }

        $level->level_name = $params['level_name'];
        $DB->update_record('local_reblibrary_edu_levels', $level);

        return [
            'id' => $level->id,
            'level_name' => $level->level_name,
        ];
    }

    /**
     * Returns description of update_level return value.
     */
    public static function update_level_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Level ID'),
            'level_name' => new external_value(PARAM_TEXT, 'Level name'),
        ]);
    }

    /**
     * Returns description of delete_level parameters.
     */
    public static function delete_level_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Level ID'),
        ]);
    }

    /**
     * Delete an education level.
     */
    public static function delete_level($id) {
        global $DB;

        $params = self::validate_parameters(self::delete_level_parameters(), ['id' => $id]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $DB->delete_records('local_reblibrary_edu_levels', ['id' => $params['id']]);

        return ['success' => true];
    }

    /**
     * Returns description of delete_level return value.
     */
    public static function delete_level_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success status'),
        ]);
    }

    // ============================================
    // EDUCATION SUBLEVELS
    // ============================================

    /**
     * Returns description of get_all_sublevels parameters.
     */
    public static function get_all_sublevels_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Get all education sublevels.
     */
    public static function get_all_sublevels() {
        global $DB;

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $sublevels = $DB->get_records('local_reblibrary_edu_sublevels', null, 'sublevel_name ASC');

        $result = [];
        foreach ($sublevels as $sublevel) {
            $result[] = [
                'id' => $sublevel->id,
                'sublevel_name' => $sublevel->sublevel_name,
                'level_id' => $sublevel->level_id,
            ];
        }

        return $result;
    }

    /**
     * Returns description of get_all_sublevels return value.
     */
    public static function get_all_sublevels_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Sublevel ID'),
                'sublevel_name' => new external_value(PARAM_TEXT, 'Sublevel name'),
                'level_id' => new external_value(PARAM_INT, 'Parent level ID'),
            ])
        );
    }

    /**
     * Returns description of create_sublevel parameters.
     */
    public static function create_sublevel_parameters() {
        return new external_function_parameters([
            'sublevel_name' => new external_value(PARAM_TEXT, 'Sublevel name'),
            'level_id' => new external_value(PARAM_INT, 'Parent level ID'),
        ]);
    }

    /**
     * Create a new education sublevel.
     */
    public static function create_sublevel($sublevelname, $levelid) {
        global $DB;

        $params = self::validate_parameters(self::create_sublevel_parameters(), [
            'sublevel_name' => $sublevelname,
            'level_id' => $levelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        // Check for duplicate.
        if ($DB->record_exists('local_reblibrary_edu_sublevels', ['sublevel_name' => $params['sublevel_name']])) {
            throw new \moodle_exception('error_duplicate_sublevel_name', 'local_reblibrary');
        }

        $record = new \stdClass();
        $record->sublevel_name = $params['sublevel_name'];
        $record->level_id = $params['level_id'];

        $id = $DB->insert_record('local_reblibrary_edu_sublevels', $record);

        $sublevel = $DB->get_record('local_reblibrary_edu_sublevels', ['id' => $id], '*', MUST_EXIST);

        return [
            'id' => $sublevel->id,
            'sublevel_name' => $sublevel->sublevel_name,
            'level_id' => $sublevel->level_id,
        ];
    }

    /**
     * Returns description of create_sublevel return value.
     */
    public static function create_sublevel_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Sublevel ID'),
            'sublevel_name' => new external_value(PARAM_TEXT, 'Sublevel name'),
            'level_id' => new external_value(PARAM_INT, 'Parent level ID'),
        ]);
    }

    /**
     * Returns description of update_sublevel parameters.
     */
    public static function update_sublevel_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Sublevel ID'),
            'sublevel_name' => new external_value(PARAM_TEXT, 'Sublevel name'),
            'level_id' => new external_value(PARAM_INT, 'Parent level ID'),
        ]);
    }

    /**
     * Update an education sublevel.
     */
    public static function update_sublevel($id, $sublevelname, $levelid) {
        global $DB;

        $params = self::validate_parameters(self::update_sublevel_parameters(), [
            'id' => $id,
            'sublevel_name' => $sublevelname,
            'level_id' => $levelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $sublevel = $DB->get_record('local_reblibrary_edu_sublevels', ['id' => $params['id']], '*', MUST_EXIST);

        // Check for duplicate (excluding current record).
        if ($DB->record_exists_sql(
            "SELECT id FROM {local_reblibrary_edu_sublevels} WHERE sublevel_name = ? AND id != ?",
            [$params['sublevel_name'], $params['id']]
        )) {
            throw new \moodle_exception('error_duplicate_sublevel_name', 'local_reblibrary');
        }

        $sublevel->sublevel_name = $params['sublevel_name'];
        $sublevel->level_id = $params['level_id'];
        $DB->update_record('local_reblibrary_edu_sublevels', $sublevel);

        return [
            'id' => $sublevel->id,
            'sublevel_name' => $sublevel->sublevel_name,
            'level_id' => $sublevel->level_id,
        ];
    }

    /**
     * Returns description of update_sublevel return value.
     */
    public static function update_sublevel_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Sublevel ID'),
            'sublevel_name' => new external_value(PARAM_TEXT, 'Sublevel name'),
            'level_id' => new external_value(PARAM_INT, 'Parent level ID'),
        ]);
    }

    /**
     * Returns description of delete_sublevel parameters.
     */
    public static function delete_sublevel_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Sublevel ID'),
        ]);
    }

    /**
     * Delete an education sublevel.
     */
    public static function delete_sublevel($id) {
        global $DB;

        $params = self::validate_parameters(self::delete_sublevel_parameters(), ['id' => $id]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $DB->delete_records('local_reblibrary_edu_sublevels', ['id' => $params['id']]);

        return ['success' => true];
    }

    /**
     * Returns description of delete_sublevel return value.
     */
    public static function delete_sublevel_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success status'),
        ]);
    }

    // ============================================
    // CLASSES
    // ============================================

    /**
     * Returns description of get_all_classes parameters.
     */
    public static function get_all_classes_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Get all classes.
     */
    public static function get_all_classes() {
        global $DB;

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $classes = $DB->get_records('local_reblibrary_classes', null, 'class_code ASC');

        $result = [];
        foreach ($classes as $class) {
            $result[] = [
                'id' => $class->id,
                'class_name' => $class->class_name,
                'class_code' => $class->class_code,
                'sublevel_id' => $class->sublevel_id,
            ];
        }

        return $result;
    }

    /**
     * Returns description of get_all_classes return value.
     */
    public static function get_all_classes_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Class ID'),
                'class_name' => new external_value(PARAM_TEXT, 'Class name'),
                'class_code' => new external_value(PARAM_TEXT, 'Class code'),
                'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
            ])
        );
    }

    /**
     * Returns description of create_class parameters.
     */
    public static function create_class_parameters() {
        return new external_function_parameters([
            'class_name' => new external_value(PARAM_TEXT, 'Class name'),
            'class_code' => new external_value(PARAM_TEXT, 'Class code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Create a new class.
     */
    public static function create_class($classname, $classcode, $sublevelid) {
        global $DB;

        $params = self::validate_parameters(self::create_class_parameters(), [
            'class_name' => $classname,
            'class_code' => $classcode,
            'sublevel_id' => $sublevelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        // Check for duplicate name.
        if ($DB->record_exists('local_reblibrary_classes', ['class_name' => $params['class_name']])) {
            throw new \moodle_exception('error_duplicate_class_name', 'local_reblibrary');
        }

        // Check for duplicate code.
        if ($DB->record_exists('local_reblibrary_classes', ['class_code' => $params['class_code']])) {
            throw new \moodle_exception('error_duplicate_class_code', 'local_reblibrary');
        }

        $record = new \stdClass();
        $record->class_name = $params['class_name'];
        $record->class_code = $params['class_code'];
        $record->sublevel_id = $params['sublevel_id'];

        $id = $DB->insert_record('local_reblibrary_classes', $record);

        $class = $DB->get_record('local_reblibrary_classes', ['id' => $id], '*', MUST_EXIST);

        return [
            'id' => $class->id,
            'class_name' => $class->class_name,
            'class_code' => $class->class_code,
            'sublevel_id' => $class->sublevel_id,
        ];
    }

    /**
     * Returns description of create_class return value.
     */
    public static function create_class_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Class ID'),
            'class_name' => new external_value(PARAM_TEXT, 'Class name'),
            'class_code' => new external_value(PARAM_TEXT, 'Class code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Returns description of update_class parameters.
     */
    public static function update_class_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Class ID'),
            'class_name' => new external_value(PARAM_TEXT, 'Class name'),
            'class_code' => new external_value(PARAM_TEXT, 'Class code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Update a class.
     */
    public static function update_class($id, $classname, $classcode, $sublevelid) {
        global $DB;

        $params = self::validate_parameters(self::update_class_parameters(), [
            'id' => $id,
            'class_name' => $classname,
            'class_code' => $classcode,
            'sublevel_id' => $sublevelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $class = $DB->get_record('local_reblibrary_classes', ['id' => $params['id']], '*', MUST_EXIST);

        // Check for duplicate name (excluding current record).
        if ($DB->record_exists_sql(
            "SELECT id FROM {local_reblibrary_classes} WHERE class_name = ? AND id != ?",
            [$params['class_name'], $params['id']]
        )) {
            throw new \moodle_exception('error_duplicate_class_name', 'local_reblibrary');
        }

        // Check for duplicate code (excluding current record).
        if ($DB->record_exists_sql(
            "SELECT id FROM {local_reblibrary_classes} WHERE class_code = ? AND id != ?",
            [$params['class_code'], $params['id']]
        )) {
            throw new \moodle_exception('error_duplicate_class_code', 'local_reblibrary');
        }

        $class->class_name = $params['class_name'];
        $class->class_code = $params['class_code'];
        $class->sublevel_id = $params['sublevel_id'];
        $DB->update_record('local_reblibrary_classes', $class);

        return [
            'id' => $class->id,
            'class_name' => $class->class_name,
            'class_code' => $class->class_code,
            'sublevel_id' => $class->sublevel_id,
        ];
    }

    /**
     * Returns description of update_class return value.
     */
    public static function update_class_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Class ID'),
            'class_name' => new external_value(PARAM_TEXT, 'Class name'),
            'class_code' => new external_value(PARAM_TEXT, 'Class code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Returns description of delete_class parameters.
     */
    public static function delete_class_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Class ID'),
        ]);
    }

    /**
     * Delete a class.
     */
    public static function delete_class($id) {
        global $DB;

        $params = self::validate_parameters(self::delete_class_parameters(), ['id' => $id]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $DB->delete_records('local_reblibrary_classes', ['id' => $params['id']]);

        return ['success' => true];
    }

    /**
     * Returns description of delete_class return value.
     */
    public static function delete_class_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success status'),
        ]);
    }

    // ============================================
    // SECTIONS
    // ============================================

    /**
     * Returns description of get_all_sections parameters.
     */
    public static function get_all_sections_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Get all sections.
     */
    public static function get_all_sections() {
        global $DB;

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $sections = $DB->get_records('local_reblibrary_sections', null, 'section_code ASC');

        $result = [];
        foreach ($sections as $section) {
            $result[] = [
                'id' => $section->id,
                'section_name' => $section->section_name,
                'section_code' => $section->section_code,
                'sublevel_id' => $section->sublevel_id,
            ];
        }

        return $result;
    }

    /**
     * Returns description of get_all_sections return value.
     */
    public static function get_all_sections_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Section ID'),
                'section_name' => new external_value(PARAM_TEXT, 'Section name'),
                'section_code' => new external_value(PARAM_TEXT, 'Section code'),
                'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
            ])
        );
    }

    /**
     * Returns description of create_section parameters.
     */
    public static function create_section_parameters() {
        return new external_function_parameters([
            'section_name' => new external_value(PARAM_TEXT, 'Section name'),
            'section_code' => new external_value(PARAM_TEXT, 'Section code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Create a new section.
     */
    public static function create_section($sectionname, $sectioncode, $sublevelid) {
        global $DB;

        $params = self::validate_parameters(self::create_section_parameters(), [
            'section_name' => $sectionname,
            'section_code' => $sectioncode,
            'sublevel_id' => $sublevelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        // Check for duplicate code.
        if ($DB->record_exists('local_reblibrary_sections', ['section_code' => $params['section_code']])) {
            throw new \moodle_exception('error_duplicate_section_code', 'local_reblibrary');
        }

        $record = new \stdClass();
        $record->section_name = $params['section_name'];
        $record->section_code = $params['section_code'];
        $record->sublevel_id = $params['sublevel_id'];

        $id = $DB->insert_record('local_reblibrary_sections', $record);

        $section = $DB->get_record('local_reblibrary_sections', ['id' => $id], '*', MUST_EXIST);

        return [
            'id' => $section->id,
            'section_name' => $section->section_name,
            'section_code' => $section->section_code,
            'sublevel_id' => $section->sublevel_id,
        ];
    }

    /**
     * Returns description of create_section return value.
     */
    public static function create_section_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Section ID'),
            'section_name' => new external_value(PARAM_TEXT, 'Section name'),
            'section_code' => new external_value(PARAM_TEXT, 'Section code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Returns description of update_section parameters.
     */
    public static function update_section_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Section ID'),
            'section_name' => new external_value(PARAM_TEXT, 'Section name'),
            'section_code' => new external_value(PARAM_TEXT, 'Section code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Update a section.
     */
    public static function update_section($id, $sectionname, $sectioncode, $sublevelid) {
        global $DB;

        $params = self::validate_parameters(self::update_section_parameters(), [
            'id' => $id,
            'section_name' => $sectionname,
            'section_code' => $sectioncode,
            'sublevel_id' => $sublevelid,
        ]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $section = $DB->get_record('local_reblibrary_sections', ['id' => $params['id']], '*', MUST_EXIST);

        // Check for duplicate code (excluding current record).
        if ($DB->record_exists_sql(
            "SELECT id FROM {local_reblibrary_sections} WHERE section_code = ? AND id != ?",
            [$params['section_code'], $params['id']]
        )) {
            throw new \moodle_exception('error_duplicate_section_code', 'local_reblibrary');
        }

        $section->section_name = $params['section_name'];
        $section->section_code = $params['section_code'];
        $section->sublevel_id = $params['sublevel_id'];
        $DB->update_record('local_reblibrary_sections', $section);

        return [
            'id' => $section->id,
            'section_name' => $section->section_name,
            'section_code' => $section->section_code,
            'sublevel_id' => $section->sublevel_id,
        ];
    }

    /**
     * Returns description of update_section return value.
     */
    public static function update_section_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Section ID'),
            'section_name' => new external_value(PARAM_TEXT, 'Section name'),
            'section_code' => new external_value(PARAM_TEXT, 'Section code'),
            'sublevel_id' => new external_value(PARAM_INT, 'Parent sublevel ID'),
        ]);
    }

    /**
     * Returns description of delete_section parameters.
     */
    public static function delete_section_parameters() {
        return new external_function_parameters([
            'id' => new external_value(PARAM_INT, 'Section ID'),
        ]);
    }

    /**
     * Delete a section.
     */
    public static function delete_section($id) {
        global $DB;

        $params = self::validate_parameters(self::delete_section_parameters(), ['id' => $id]);

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('moodle/site:config', $context);

        $DB->delete_records('local_reblibrary_sections', ['id' => $params['id']]);

        return ['success' => true];
    }

    /**
     * Returns description of delete_section return value.
     */
    public static function delete_section_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Success status'),
        ]);
    }
}
