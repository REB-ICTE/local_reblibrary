/**
 * Library menu configuration for REB Library.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export interface MenuItem {
    name: string;
    url: string;
    icon: string;
    active?: boolean;
}

/**
 * Get library menu items.
 * @param activePage - The currently active page identifier
 * @returns Array of library menu items
 */
export function getLibraryMenuItems(activePage: string = ''): MenuItem[] {
    return [
        {
            name: "Library Home",
            url: "/local/reblibrary/index.php",
            icon: "fa fa-home",
            active: activePage === 'home'
        },
        {
            name: "Browse",
            url: "/local/reblibrary/browse.php",
            icon: "fa fa-compass",
            active: activePage === 'browse'
        },
        {
            name: "Search",
            url: "/local/reblibrary/search.php",
            icon: "fa fa-search",
            active: activePage === 'search'
        },
        {
            name: "My Collection",
            url: "/local/reblibrary/collection.php",
            icon: "fa fa-bookmark",
            active: activePage === 'collection'
        },
    ];
}
