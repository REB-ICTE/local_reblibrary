import { h } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import type { Resource } from "../services/resources";
import type { Category } from "../services/categories";
import Sidebar from "./shared/Sidebar";
import PDFReader from "./shared/PDFReader";
import { getAdminMenuItems } from "../config/admin-menu";
import { getLibraryMenuItems } from "../config/library-menu";

interface EducationLevel {
    id: number | string;
    level_name: string;
}

interface EducationSublevel {
    id: number | string;
    sublevel_name: string;
    level_id: number | string;
}

interface Class {
    id: number | string;
    class_name: string;
    class_code: string;
    sublevel_id: number | string;
    sublevel_name: string;
    level_id: number | string;
    level_name: string;
}

interface LibraryHomeProps {
    initialResources: Resource[];
    initialLevels: EducationLevel[];
    initialSublevels: EducationSublevel[];
    initialClasses: Class[];
    initialCategories: Category[];
}

interface BookCardProps {
    resource: Resource;
    onViewBook?: (resource: Resource) => void;
}

const BookCard = ({ resource, onViewBook }: BookCardProps) => {
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200"%3E%3Crect fill="%23e5e7eb" width="140" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Cover%3C/text%3E%3C/svg%3E';

    return (
        <div
            className="book-card"
            onClick={() => resource.file_url && onViewBook?.(resource)}
            style={{ cursor: resource.file_url ? 'pointer' : 'default' }}
        >
            <div className="book-cover-container">
                <img
                    src={resource.cover_image_url || placeholderImage}
                    alt={resource.title}
                    className="book-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                />
            </div>
            <h3 className="book-title truncate" title={resource.title}>{resource.title}</h3>
            <p className="book-author truncate" title={resource.author_name}>{resource.author_name}</p>
            {resource.isbn && <p className="book-isbn truncate" title={`ISBN: ${resource.isbn}`}>ISBN: {resource.isbn}</p>}
        </div>
    );
};

interface HorizontalScrollContainerProps {
    children: preact.ComponentChildren;
}

const HorizontalScrollContainer = ({ children }: HorizontalScrollContainerProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;
        const targetScroll = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    return (
        <div className="relative">
            {showLeftButton && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
                    style={{ marginLeft: '-20px' }}
                    aria-label="Scroll left"
                >
                    <i className="fa fa-chevron-left text-gray-700"></i>
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-2"
                onScroll={checkScrollButtons}
                style={{ scrollbarWidth: 'thin' }}
            >
                {children}
            </div>

            {showRightButton && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
                    style={{ marginRight: '-20px' }}
                    aria-label="Scroll right"
                >
                    <i className="fa fa-chevron-right text-gray-700"></i>
                </button>
            )}
        </div>
    );
};

export default function LibraryHome({
    initialResources,
    initialLevels,
    initialSublevels,
    initialClasses,
    initialCategories
}: LibraryHomeProps) {
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [viewingResource, setViewingResource] = useState<Resource | null>(null);

    // Read search query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');

    // Read filter state from URL params (for display purposes in dropdowns)
    const selectedLevelId = urlParams.get('level_id') ? parseInt(urlParams.get('level_id')!) : null;
    const selectedSublevelId = urlParams.get('sublevel_id') ? parseInt(urlParams.get('sublevel_id')!) : null;
    const selectedClassId = urlParams.get('class_id') ? parseInt(urlParams.get('class_id')!) : null;
    const selectedCategoryId = urlParams.get('category_id') ? parseInt(urlParams.get('category_id')!) : null;

    // Menu items
    const libraryMenuItems = getLibraryMenuItems('home');

    // Check if user is admin (from PHP)
    const rootElement = document.getElementById('library-home-root');
    const isAdmin = rootElement?.dataset.isAdmin === '1';
    const adminMenuItems = isAdmin ? getAdminMenuItems('') : [];

    // Helper function to navigate with URL params
    const navigateWithFilters = (params: {
        level_id?: string | null;
        sublevel_id?: string | null;
        class_id?: string | null;
        category_id?: string | null;
        q?: string | null;
    }) => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        // Update or remove each param
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        });

        // Navigate to new URL (this will reload the page with new filters)
        window.location.href = url.pathname + url.search;
    };

    // Filter sublevels based on selected level
    const filteredSublevels = useMemo(() => {
        if (!selectedLevelId) return initialSublevels;
        return initialSublevels.filter(sl => parseInt(sl.level_id as any) === selectedLevelId);
    }, [selectedLevelId, initialSublevels]);

    // Filter classes based on selected sublevel
    const filteredClasses = useMemo(() => {
        if (!selectedSublevelId) {
            // If only level is selected, show all classes for that level
            if (selectedLevelId) {
                return initialClasses.filter(c => parseInt(c.level_id as any) === selectedLevelId);
            }
            return initialClasses;
        }
        return initialClasses.filter(c => parseInt(c.sublevel_id as any) === selectedSublevelId);
    }, [selectedLevelId, selectedSublevelId, initialClasses]);

    // Handle level change - navigate with new URL params
    const handleLevelChange = (levelId: number | null) => {
        navigateWithFilters({
            level_id: levelId ? String(levelId) : null,
            sublevel_id: null,
            class_id: null,
            category_id: selectedCategoryId ? String(selectedCategoryId) : null,
            q: searchQuery || null
        });
    };

    // Handle sublevel change - navigate with new URL params
    const handleSublevelChange = (sublevelId: number | null) => {
        navigateWithFilters({
            level_id: selectedLevelId ? String(selectedLevelId) : null,
            sublevel_id: sublevelId ? String(sublevelId) : null,
            class_id: null,
            category_id: selectedCategoryId ? String(selectedCategoryId) : null,
            q: searchQuery || null
        });
    };

    // Handle class change - navigate with new URL params
    const handleClassChange = (classId: number | null) => {
        navigateWithFilters({
            level_id: selectedLevelId ? String(selectedLevelId) : null,
            sublevel_id: selectedSublevelId ? String(selectedSublevelId) : null,
            class_id: classId ? String(classId) : null,
            category_id: selectedCategoryId ? String(selectedCategoryId) : null,
            q: searchQuery || null
        });
    };

    // Handle category change - navigate with new URL params
    const handleCategoryChange = (categoryId: number | null) => {
        navigateWithFilters({
            level_id: selectedLevelId ? String(selectedLevelId) : null,
            sublevel_id: selectedSublevelId ? String(selectedSublevelId) : null,
            class_id: selectedClassId ? String(selectedClassId) : null,
            category_id: categoryId ? String(categoryId) : null,
            q: searchQuery || null
        });
    };

    // Handle search - navigate with new URL params
    const handleSearch = (query: string) => {
        navigateWithFilters({
            level_id: selectedLevelId ? String(selectedLevelId) : null,
            sublevel_id: selectedSublevelId ? String(selectedSublevelId) : null,
            class_id: selectedClassId ? String(selectedClassId) : null,
            category_id: selectedCategoryId ? String(selectedCategoryId) : null,
            q: query || null
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        window.location.href = '/local/reblibrary/index.php';
    };

    // Since filtering is now done on backend, filteredResources is just the resources we received
    const filteredResources = resources;

    // Group resources by class
    const resourcesByClass = useMemo(() => {
        const grouped = new Map<number, { class: Class; resources: Resource[] }>();

        // Get all classes that should be displayed (respecting filters)
        const classesToShow = selectedClassId
            ? filteredClasses.filter(c => parseInt(c.id as any) === selectedClassId)
            : filteredClasses;

        // Initialize with classes
        classesToShow.forEach(cls => {
            const classIdNum = parseInt(cls.id as any);
            grouped.set(classIdNum, { class: cls, resources: [] });
        });

        // Distribute resources to their classes
        filteredResources.forEach(resource => {
            if (resource.class_ids && resource.class_ids.length > 0) {
                resource.class_ids.forEach(classId => {
                    const classIdNum = parseInt(classId as any);
                    if (grouped.has(classIdNum)) {
                        grouped.get(classIdNum)!.resources.push(resource);
                    }
                });
            }
        });

        // Sort by level, sublevel, class name
        return Array.from(grouped.values()).sort((a, b) => {
            // First by level name
            if (a.class.level_name !== b.class.level_name) {
                return a.class.level_name.localeCompare(b.class.level_name);
            }
            // Then by sublevel name
            if (a.class.sublevel_name !== b.class.sublevel_name) {
                return a.class.sublevel_name.localeCompare(b.class.sublevel_name);
            }
            // Finally by class name
            return a.class.class_name.localeCompare(b.class.class_name);
        });
    }, [filteredResources, filteredClasses, selectedClassId]);

    // Get unassigned resources (resources with no class assignments)
    const unassignedResources = useMemo(() => {
        return filteredResources.filter(r => !r.class_ids || r.class_ids.length === 0);
    }, [filteredResources]);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar
                adminMenuItems={adminMenuItems}
                libraryMenuItems={libraryMenuItems}
                levels={initialLevels}
                sublevels={initialSublevels}
                classes={initialClasses}
            />

            <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                {viewingResource ? (
                    <PDFReader
                        resource={viewingResource}
                        onClose={() => setViewingResource(null)}
                    />
                ) : (
                <>
                    {/* Fixed Header: Search Bar and Filters */}
                    <div className="flex-shrink-0 p-8 pb-4 bg-gray-50">
                        {/* Search and Filter Component */}
                        <div className="max-w-4xl mx-auto">
                            {/* Search Bar */}
                            <div className="mb-3">
                                <div className="library-search relative">
                                    <i className="fa fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder="Search books by title or author..."
                                        value={searchQuery}
                                        onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(searchQuery);
                                            }
                                        }}
                                        className="search-input"
                                        style={{ paddingRight: '90px' }}
                                    />
                                    <button
                                        onClick={() => handleSearch(searchQuery)}
                                        className="absolute right-2 top-1/2 px-3 py-1 bg-reb-blue text-white rounded hover:bg-blue-700 text-sm"
                                        style={{ transform: 'translateY(-50%)' }}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex flex-wrap gap-3 justify-center">
                            {/* Level Filter */}
                            <div className="inline-block">
                                <select
                                    value={selectedLevelId || ''}
                                    onChange={(e) => handleLevelChange(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                                    className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
                                >
                                    <option value="">All Levels</option>
                                    {initialLevels.map(level => (
                                        <option key={level.id} value={String(level.id)}>
                                            {level.level_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sublevel Filter */}
                            <div className="inline-block">
                                <select
                                    value={selectedSublevelId || ''}
                                    onChange={(e) => handleSublevelChange(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                                    disabled={!selectedLevelId}
                                    className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <option value="">All Sublevels</option>
                                    {filteredSublevels.map(sublevel => (
                                        <option key={sublevel.id} value={String(sublevel.id)}>
                                            {sublevel.sublevel_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div className="inline-block">
                                <select
                                    value={selectedClassId || ''}
                                    onChange={(e) => handleClassChange(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                                    className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
                                >
                                    <option value="">All Classes</option>
                                    {filteredClasses.map(cls => (
                                        <option key={cls.id} value={String(cls.id)}>
                                            {cls.class_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="inline-block">
                                <select
                                    value={selectedCategoryId || ''}
                                    onChange={(e) => handleCategoryChange(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                                    className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
                                >
                                    <option value="">All Categories</option>
                                    {initialCategories.map(category => (
                                        <option key={category.id} value={String(category.id)}>
                                            {category.parent_name ? `${category.parent_name} > ` : ''}{category.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {(selectedLevelId || selectedSublevelId || selectedClassId || selectedCategoryId || searchQuery) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                >
                                    <i className="fa fa-times mr-1"></i>
                                    Clear All
                                </button>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content: Books List */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        {/* Main Content Area - Class-based Sections */}
                        {resourcesByClass.length > 0 ? (
                            resourcesByClass.map(({ class: cls, resources: classResources }) => (
                                classResources.length > 0 && (
                                    <section key={cls.id} className="library-section">
                                        <div className="mb-2">
                                            <h2 className="section-title text-2xl font-bold text-gray-900">
                                                {cls.class_name}
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                {cls.level_name} → {cls.sublevel_name}
                                            </p>
                                        </div>
                                        <HorizontalScrollContainer>
                                            <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
                                                {classResources.map(resource => (
                                                    <div key={resource.id} className="flex-shrink-0" style={{ width: '160px' }}>
                                                        <BookCard resource={resource} onViewBook={setViewingResource} />
                                                    </div>
                                                ))}
                                            </div>
                                        </HorizontalScrollContainer>
                                    </section>
                                )
                            ))
                        ) : unassignedResources.length > 0 ? (
                            <section className="library-section">
                                <h2 className="section-title">Unassigned Resources</h2>
                                <HorizontalScrollContainer>
                                    <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
                                        {unassignedResources.map(resource => (
                                            <div key={resource.id} className="flex-shrink-0" style={{ width: '160px' }}>
                                                <BookCard resource={resource} onViewBook={setViewingResource} />
                                            </div>
                                        ))}
                                    </div>
                                </HorizontalScrollContainer>
                            </section>
                        ) : (
                            <div className="empty-state">
                                <i className="fa fa-book text-6xl text-gray-300 mb-4"></i>
                                <p>No books found matching your filters.</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
                )}
            </main>
        </div>
    );
}
