/**
 * TypeScript type definitions for REB Library.
 *
 * @package    local_reblibrary
 * @copyright  2025 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export interface UserData {
    id: number;
    fullname: string;
    firstname: string;
    lastname: string;
    email: string;
    avatar: string;
    roles: string[];
}

export interface StatsData {
    totalResources: number;
    totalAuthors: number;
    totalCategories: number;
    totalClasses: number;
}
