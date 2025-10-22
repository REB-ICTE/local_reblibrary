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
 * REB Library home page.
 *
 * This page displays the library homepage accessible to both
 * authenticated users and guests.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once($CFG->dirroot . '/local/reblibrary/lib.php');

// Allow both authenticated users and guests to access this page.
require_login(null, true);

// Set up the page context.
$context = context_system::instance();
$PAGE->set_context($context);
$PAGE->set_url(new moodle_url('/local/reblibrary/index.php'));
$PAGE->set_pagelayout('standard');
$PAGE->set_title(get_string('librarypage_title', 'local_reblibrary'));
$PAGE->set_heading(get_string('librarypage_heading', 'local_reblibrary'));

// Load custom CSS.
$PAGE->requires->css('/local/reblibrary/styles.css');

// Add breadcrumb navigation.
$PAGE->navbar->add(get_string('pluginname', 'local_reblibrary'));

/**
 * Helper function to generate star rating array.
 *
 * @param int $rating Rating from 1-5
 * @return array Array of star objects
 */
function generate_stars($rating) {
    $stars = [];
    for ($i = 1; $i <= 5; $i++) {
        $stars[] = ['empty' => $i > $rating];
    }
    return $stars;
}

// Prepare header data.
$headercontext = [
    'logo_text' => get_string('header_logo', 'local_reblibrary'),
    'search_placeholder' => get_string('header_search_placeholder', 'local_reblibrary'),
    'subscribe_text' => get_string('header_subscribe', 'local_reblibrary'),
    'user_fullname' => fullname($USER),
    'user_picture_url' => $OUTPUT->get_generated_image_for_id($USER->id),
    'user_initials' => strtoupper(substr($USER->firstname, 0, 1) . substr($USER->lastname, 0, 1)),
    'has_notifications' => false,
    'notification_count' => 0,
];

// Prepare sidebar navigation data.
$sidebarcontext = [
    'browse_heading' => get_string('sidebar_browse', 'local_reblibrary'),
    'browse_items' => [
        ['name' => get_string('nav_topbooks', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-star', 'active' => false],
        ['name' => get_string('nav_discover', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-compass', 'active' => false],
        ['name' => get_string('nav_categories', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-th-large', 'active' => false],
    ],
    'your_books_heading' => get_string('sidebar_your_books', 'local_reblibrary'),
    'your_books_items' => [
        ['name' => get_string('nav_reading', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-book-open', 'active' => false],
        ['name' => get_string('nav_favorite', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-heart', 'active' => false],
        ['name' => get_string('nav_history', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-history', 'active' => false],
    ],
    'shelves_heading' => get_string('sidebar_shelves', 'local_reblibrary'),
    'shelves_items' => [
        ['name' => get_string('nav_your_shelves', 'local_reblibrary'), 'url' => '#', 'icon' => 'fa fa-bookmark', 'active' => false],
    ],
    'create_shelf_text' => get_string('btn_create_shelf', 'local_reblibrary'),
];

// Placeholder book data - Recently Added.
$recentlyadded = [
    ['title' => 'Steve Jobs', 'author' => 'Walter Isaacson', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Radical', 'author' => 'David Platt', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Ender\'s Game', 'author' => 'Orson Scott Card', 'cover_url' => '', 'stars' => generate_stars(4), 'has_actions' => true],
    ['title' => 'The Perks of Being a Wallflower', 'author' => 'Stephen Chbosky', 'cover_url' => '', 'stars' => generate_stars(0), 'has_actions' => false],
    ['title' => 'The Hobbit', 'author' => 'J.R.R. Tolkien', 'cover_url' => '', 'stars' => generate_stars(5), 'has_actions' => false],
    ['title' => 'Holbein - Masterpieces', 'author' => 'L.R. Henssman', 'cover_url' => '', 'stars' => generate_stars(0), 'has_actions' => false],
    ['title' => 'The Coral Island', 'author' => 'R.M. Ballantyne', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
];

// Placeholder book data - Recommended For You.
$recommended = [
    ['title' => 'An American Life', 'author' => 'Ronald Reagan', 'cover_url' => '', 'stars' => generate_stars(2), 'has_actions' => false],
    ['title' => 'The Return of Sherlock Holmes', 'author' => 'Arthur Conan Doyle', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Ender\'s Game', 'author' => 'Orson Scott Card', 'cover_url' => '', 'stars' => generate_stars(4), 'has_actions' => false],
    ['title' => 'The Sound of Things Falling', 'author' => 'Juan Gabriel Vásquez', 'cover_url' => '', 'stars' => generate_stars(2), 'has_actions' => false],
    ['title' => 'The Fault In Our Stars', 'author' => 'John Green', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Just My Type', 'author' => 'Simon Garfield', 'cover_url' => '', 'stars' => generate_stars(5), 'has_actions' => false],
    ['title' => 'Wake', 'author' => 'Amanda Hocking', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Fearless Captain', 'author' => 'Aleck Loker', 'cover_url' => '', 'stars' => generate_stars(2), 'has_actions' => false],
    ['title' => 'Execute', 'author' => 'Drew Wilson & Josh Long', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'Harry Potter and the Deathly Hallows', 'author' => 'J.K. Rowling', 'cover_url' => '', 'stars' => generate_stars(4), 'has_actions' => false],
    ['title' => 'I Kissed Dating Goodbye', 'author' => 'Joshua Harris', 'cover_url' => '', 'stars' => generate_stars(2), 'has_actions' => false],
    ['title' => 'White Fang', 'author' => 'Jack London', 'cover_url' => '', 'stars' => generate_stars(3), 'has_actions' => false],
    ['title' => 'The 7 Habits of Highly Effective People', 'author' => 'Stephen R. Covey', 'cover_url' => '', 'stars' => generate_stars(4), 'has_actions' => false],
    ['title' => 'The Harbinger', 'author' => 'Jonathan Cahn', 'cover_url' => '', 'stars' => generate_stars(5), 'has_actions' => false],
];

// Placeholder friend data.
$friends = [
    ['name' => 'Neil Patrick Harris', 'reading' => 'Fantasy Life - Match...', 'avatar_url' => ''],
    ['name' => 'Robert Downey, Jr.', 'reading' => 'It\'s Just a Good Da...', 'avatar_url' => ''],
    ['name' => 'Russell Crowe', 'reading' => 'This Town - Mark Lel...', 'avatar_url' => ''],
];

// Prepare data for template.
$templatecontext = [
    'header' => $headercontext,
    'sidebar' => $sidebarcontext,
    'recently_added_title' => get_string('section_recently_added', 'local_reblibrary'),
    'recently_added' => $recentlyadded,
    'recommended_title' => get_string('section_recommended', 'local_reblibrary'),
    'recommended' => $recommended,
    'friends_heading' => get_string('friends_heading', 'local_reblibrary'),
    'friends' => $friends,
];

// Output the page.
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_reblibrary/header', $headercontext);
echo $OUTPUT->render_from_template('local_reblibrary/library_home', $templatecontext);
echo $OUTPUT->footer();
