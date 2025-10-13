# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plugin Overview

**REB Library** (`local_reblibrary`) is a Moodle local plugin for the REB e-learning platform. Local plugins extend Moodle functionality without being tied to specific activity types, blocks, or themes.

**Location:** `moodle_app/public/local/reblibrary/`

**Current Status:** Active development. Library home page implemented with placeholder content.

## Plugin Structure

```
local/reblibrary/
├── version.php              # Plugin metadata (version, requirements)
├── lib.php                  # Core plugin functions (navigation hooks)
├── settings.php             # Admin settings page
├── index.php                # Library home page (accessible to all users)
├── lang/en/
│   └── local_reblibrary.php # English language strings
├── templates/
│   └── library_home.mustache # Home page template (Bootstrap 5)
├── classes/                 # Autoloaded PHP classes (empty)
└── db/                      # Database definitions (empty)
```

## Library Home Page

**URL:** http://localhost:8080/local/reblibrary/

The library home page is accessible to both authenticated users and guests. It displays placeholder content using Bootstrap 5 components.

**Key Files:**
- `index.php` - Page controller (sets up context, page config, renders template)
- `templates/library_home.mustache` - Mustache template using Bootstrap 5
- `lang/en/local_reblibrary.php` - Contains all language strings for the page

**Template Structure:**
- Uses Bootstrap 5 `.container`, `.row`, `.col` for responsive layout
- `.alert-info` for welcome message
- `.card` components for content blocks
- Three-column grid for feature cards

**Access Control:**
- Uses `require_login(null, true)` to allow guest access
- System context (`context_system`) - not tied to specific course
- No capability checks required for viewing

## Development Commands

**Note:** This plugin is part of a larger Moodle installation. Development commands should be run from the Moodle root (`moodle_app/`) unless otherwise specified.

### Testing Plugin Installation

```bash
# From project root
docker compose exec php php /var/www/html/moodle_app/admin/cli/upgrade.php --non-interactive

# Or visit Site Admin > Notifications in browser at http://localhost:8080
```

### Purge Caches After Changes

**Critical:** Moodle aggressively caches PHP code, language strings, and templates. Always purge caches after making changes:

```bash
docker compose exec php php /var/www/html/moodle_app/admin/cli/purge_caches.php
```

### Check Plugin Status

```bash
# Via database
docker compose exec -T mariadb mariadb -u moodleuser -pmoodlepass moodle -e \
  "SELECT name, value FROM mdl_config_plugins WHERE plugin='local_reblibrary';"

# Via CLI (list all plugins)
docker compose exec php php /var/www/html/moodle_app/admin/cli/uninstall_plugins.php --show-all
```

### Code Quality (if adding JavaScript/SCSS)

```bash
# From moodle_app/
npx grunt eslint              # Lint JavaScript
npx grunt stylelint           # Lint CSS/SCSS
npx grunt                     # Build AMD modules from amd/src/
```

## Moodle Local Plugin Architecture

Local plugins (`local/*`) are general-purpose extensions that can:
- Add navigation items to global or settings navigation
- Implement event observers to respond to Moodle events
- Provide web services (external APIs)
- Add custom admin settings
- Extend core functionality without modifying core code

### Key Files and Their Purpose

**version.php** - Required metadata:
- `$plugin->component` - Plugin identifier (`local_reblibrary`)
- `$plugin->version` - Version number (YYYYMMDDXX format)
- `$plugin->requires` - Minimum Moodle version required
- `$plugin->maturity` - Development status (ALPHA, BETA, RC, STABLE)
- `$plugin->release` - Human-readable version string

**lib.php** - Hook functions (optional):
- `local_reblibrary_extend_navigation()` - Add items to main navigation
- `local_reblibrary_extend_settings_navigation()` - Add items to settings blocks

**settings.php** - Admin configuration page (optional):
- Appears under Site Admin > Plugins > Local plugins
- Use `admin_setting_*` classes to define settings
- Settings stored in `mdl_config_plugins` table

**classes/** - Autoloaded classes:
- Namespace: `\local_reblibrary\`
- Example: `classes/event/something_happened.php` → `\local_reblibrary\event\something_happened`
- Common subdirectories: `event/`, `output/`, `form/`, `external/`, `task/`

**db/install.xml** - Database schema (XMLDB format):
- Define custom tables (must be prefixed with plugin name, e.g., `local_reblibrary_items`)
- Use XMLDB editor: Site Admin > Development > XMLDB editor

**db/upgrade.php** - Database migration logic:
- Function: `xmldb_local_reblibrary_upgrade($oldversion)`
- Increment `$plugin->version` in `version.php` to trigger

**db/events.php** - Event observers:
- Subscribe to Moodle events (e.g., `\core\event\user_created`)
- Maps events to callback classes

**db/services.php** - Web service definitions:
- Define external API functions for mobile app or third-party integrations

**lang/en/local_reblibrary.php** - Language strings:
- Key-value pairs: `$string['key'] = 'Value';`
- Access via `get_string('key', 'local_reblibrary')`
- Always define at minimum: `$string['pluginname']`

**templates/** - Mustache templates (if adding UI):
- Render via `$OUTPUT->render_from_template('local_reblibrary/templatename', $data)`

**amd/src/** - JavaScript source (ES6 modules):
- Compile to `amd/build/*.min.js` with `grunt`
- Load via `$PAGE->requires->js_call_amd('local_reblibrary/modulename', 'init')`

## Common Development Tasks

### Adding a New Class

1. Create file in `classes/` directory (e.g., `classes/manager.php`)
2. Use correct namespace: `namespace local_reblibrary;`
3. Class name must match filename: `class manager { ... }`
4. Purge caches: `docker compose exec php php /var/www/html/moodle_app/admin/cli/purge_caches.php`

### Adding Database Tables

1. Create `db/install.xml` with XMLDB structure
2. Define upgrade function in `db/upgrade.php`
3. Increment `$plugin->version` in `version.php`
4. Run upgrade: `docker compose exec php php /var/www/html/moodle_app/admin/cli/upgrade.php`

### Adding Settings

1. Edit `settings.php`
2. Add settings with `$settings->add(new admin_setting_*(...))`
3. Language string keys should be defined in `lang/en/local_reblibrary.php`
4. Purge caches

### Adding Event Observers

1. Create observer class in `classes/observer.php`
2. Define subscriptions in `db/events.php`
3. Increment version and run upgrade
4. Purge caches

## Integration with Parent Moodle Installation

This plugin is part of a Moodle 5.1 Docker environment:
- **Web root:** `moodle_app/public/` (Moodle 5.0+ structure)
- **Database:** MariaDB 11.4 (accessible via `docker compose exec mariadb`)
- **URL:** http://localhost:8080
- **Admin credentials:** `admin` / `Admin123!`

Parent project CLAUDE.md is located at `/Users/bahatijustin/Dev/reb/elearning-app/CLAUDE.md` with full Docker/Moodle documentation.

## Plugin Development Best Practices

1. **Never modify Moodle core** - All customizations should live in this plugin
2. **Use Moodle APIs** - Don't write raw SQL; use Data Manipulation API (`$DB->get_record()`, etc.)
3. **Follow coding standards** - Use `moodle-cs` phpcs standard if linting PHP
4. **Internationalize strings** - All text must use `get_string()` with lang files
5. **Purge caches frequently** - Moodle won't reflect changes without cache purge
6. **Version increments** - Update `version.php` after any `db/` changes to trigger upgrades
7. **Security** - Always use `required_param()`, `optional_param()`, and `require_capability()` checks

## Useful Moodle APIs

- **Database:** `global $DB;` - DML API for database operations
- **Output:** `global $OUTPUT;` - Rendering API
- **Page:** `global $PAGE;` - Page setup and requirements
- **User:** `global $USER;` - Current user object
- **Config:** `get_config('local_reblibrary', 'settingname')` - Retrieve plugin settings
- **Capabilities:** `require_capability('local/reblibrary:capability', $context)` - Permission checks
- **Events:** `\local_reblibrary\event\something::create()->trigger()` - Trigger custom events
