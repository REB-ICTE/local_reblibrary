import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import type { EduLevel, EduSublevel, EduClass, EduSection } from "../../services/edu-structure";
import Sidebar from "../shared/Sidebar";
import LevelTab from "./LevelTab";
import SublevelTab from "./SublevelTab";
import ClassTab from "./ClassTab";
import SectionTab from "./SectionTab";

// Signals for state management
export const levelsSignal = signal<EduLevel[]>([]);
export const sublevelsSignal = signal<EduSublevel[]>([]);
export const classesSignal = signal<EduClass[]>([]);
export const sectionsSignal = signal<EduSection[]>([]);
export const loadingSignal = signal<boolean>(false);
export const errorSignal = signal<string | null>(null);
export const successSignal = signal<string | null>(null);

interface EdStructureProps {
    initialLevels: EduLevel[];
    initialSublevels: EduSublevel[];
    initialClasses: EduClass[];
    initialSections: EduSection[];
}

export default function EdStructure({
    initialLevels,
    initialSublevels,
    initialClasses,
    initialSections
}: EdStructureProps) {
    // Initialize signals with data from PHP
    useEffect(() => {
        levelsSignal.value = initialLevels;
        sublevelsSignal.value = initialSublevels;
        classesSignal.value = initialClasses;
        sectionsSignal.value = initialSections;
    }, [initialLevels, initialSublevels, initialClasses, initialSections]);

    // Menu items for sidebar - use config functions
    const libraryMenuItems = [
        { name: "Library Home", url: "/local/reblibrary/index.php", icon: "fa fa-home", active: false },
        { name: "Browse", url: "/local/reblibrary/browse.php", icon: "fa fa-compass", active: false },
        { name: "Search", url: "/local/reblibrary/search.php", icon: "fa fa-search", active: false },
        { name: "My Collection", url: "/local/reblibrary/collection.php", icon: "fa fa-bookmark", active: false },
    ];

    const adminMenuItems = [
        { name: "Dashboard", url: "/local/reblibrary/admin/index.php", icon: "fa fa-tachometer-alt", active: false },
        { name: "Education Structure", url: "/local/reblibrary/admin/ed_structure.php", icon: "fa fa-graduation-cap", active: true },
        { name: "Resources & Authors", url: "/local/reblibrary/admin/resources.php", icon: "fa fa-book", active: false },
        { name: "Categories", url: "/local/reblibrary/admin/categories.php", icon: "fa fa-tags", active: false },
        { name: "Assignments", url: "/local/reblibrary/admin/assignments.php", icon: "fa fa-link", active: false },
    ];

    // Tab state - use URL hash or default to 'levels'
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.slice(1);
        return ['levels', 'sublevels', 'classes', 'sections'].includes(hash) ? hash : 'levels';
    });

    // Update URL hash when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        window.location.hash = tab;
    };

    // Listen for hash changes (browser back/forward)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            if (['levels', 'sublevels', 'classes', 'sections'].includes(hash)) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Auto-hide success/error messages after 5 seconds
    useEffect(() => {
        if (successSignal.value || errorSignal.value) {
            const timer = setTimeout(() => {
                successSignal.value = null;
                errorSignal.value = null;
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successSignal.value, errorSignal.value]);

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar adminMenuItems={adminMenuItems} libraryMenuItems={libraryMenuItems} />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Education Structure Management
                    </h1>

                {/* Success/Error Messages */}
                {successSignal.value && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700">{successSignal.value}</p>
                    </div>
                )}

                {errorSignal.value && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h5 className="text-lg font-semibold text-red-800 mb-2">Error</h5>
                        <p className="text-red-700">{errorSignal.value}</p>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => handleTabChange('levels')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'levels'
                                    ? 'border-reb-blue text-reb-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Education Levels
                        </button>
                        <button
                            onClick={() => handleTabChange('sublevels')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'sublevels'
                                    ? 'border-reb-blue text-reb-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Sublevels
                        </button>
                        <button
                            onClick={() => handleTabChange('classes')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'classes'
                                    ? 'border-reb-blue text-reb-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Classes
                        </button>
                        <button
                            onClick={() => handleTabChange('sections')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'sections'
                                    ? 'border-reb-blue text-reb-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Sections (A-Level)
                        </button>
                    </nav>
                </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow">
                        {activeTab === 'levels' && <LevelTab />}
                        {activeTab === 'sublevels' && <SublevelTab />}
                        {activeTab === 'classes' && <ClassTab />}
                        {activeTab === 'sections' && <SectionTab />}
                    </div>
                </div>
            </main>
        </div>
    );
}
