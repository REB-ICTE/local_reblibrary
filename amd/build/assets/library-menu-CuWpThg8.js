define(["exports"],(function(e){"use strict";/**
 * Admin menu configuration for REB Library.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function a(r=""){return[{name:"Dashboard",url:"/local/reblibrary/admin/index.php",icon:"fa fa-tachometer-alt",active:r==="dashboard"},{name:"Education Structure",url:"/local/reblibrary/admin/ed_structure.php",icon:"fa fa-graduation-cap",active:r==="education"},{name:"Resources & Authors",url:"/local/reblibrary/admin/resources.php",icon:"fa fa-book",active:r==="resources"},{name:"Categories",url:"/local/reblibrary/admin/categories.php",icon:"fa fa-tags",active:r==="categories"}]}/**
 * Library menu configuration for REB Library.
 *
 * @package    local_reblibrary
 * @copyright  2025 Rwanda Education Board
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function o(r=""){return[{name:"Resources",url:"/local/reblibrary/index.php",icon:"fa fa-book-open",active:r==="home",children:[]},{name:"Browse",url:"/local/reblibrary/browse.php",icon:"fa fa-compass",active:r==="browse"},{name:"Search",url:"/local/reblibrary/search.php",icon:"fa fa-search",active:r==="search"},{name:"My Collection",url:"/local/reblibrary/collection.php",icon:"fa fa-bookmark",active:r==="collection"}]}e.getAdminMenuItems=a,e.getLibraryMenuItems=o}));
//# sourceMappingURL=library-menu-CuWpThg8.js.map
