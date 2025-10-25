import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import type { Resource } from "../services/resources";
import type { Category } from "../services/categories";
import Sidebar from "./shared/Sidebar";
import { getAdminMenuItems } from "../config/admin-menu";
import { getLibraryMenuItems } from "../config/library-menu";

interface LibraryHomeProps {
    initialResources: Resource[];
    initialCategories: Category[];
}

interface BookCardProps {
    resource: Resource;
}

const BookCard = ({ resource }: BookCardProps) => {
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="200" viewBox="0 0 140 200"%3E%3Crect fill="%23e5e7eb" width="140" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Cover%3C/text%3E%3C/svg%3E';

    return (
        <div className="book-card">
            <div className="book-cover-container">
                <img
                    src={resource.cover_image_url || placeholderImage}
                    alt={resource.title}
                    className="book-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                />
                <div className="book-overlay">
                    <button className="book-action-btn" title="View">
                        <i className="fa fa-eye"></i>
                    </button>
                    <button className="book-action-btn" title="Add to shelf">
                        <i className="fa fa-bookmark"></i>
                    </button>
                </div>
            </div>
            <h3 className="book-title">{resource.title}</h3>
            <p className="book-author">{resource.author_name}</p>
            {resource.isbn && <p className="book-isbn">ISBN: {resource.isbn}</p>}
        </div>
    );
};

export default function LibraryHome({ initialResources, initialCategories }: LibraryHomeProps) {
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [searchQuery, setSearchQuery] = useState('');

    // Menu items
    const libraryMenuItems = getLibraryMenuItems('home');
    const adminMenuItems = getAdminMenuItems('');

    // Split resources into recently added and recommended
    const recentlyAdded = resources.slice(0, 7);
    const recommended = resources.slice(7, 21);

    const filteredResources = searchQuery
        ? resources.filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.author_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : resources;

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar adminMenuItems={adminMenuItems} libraryMenuItems={libraryMenuItems} />

            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="library-search max-w-2xl">
                            <i className="fa fa-search search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search books by title or author..."
                                value={searchQuery}
                                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    {searchQuery ? (
                        <section className="library-section">
                            <h2 className="section-title">Search Results ({filteredResources.length})</h2>
                            <div className="books-grid">
                                {filteredResources.map(resource => (
                                    <BookCard key={resource.id} resource={resource} />
                                ))}
                            </div>
                            {filteredResources.length === 0 && (
                                <div className="empty-state">
                                    <i className="fa fa-search text-6xl text-gray-300 mb-4"></i>
                                    <p>No books found matching "{searchQuery}"</p>
                                </div>
                            )}
                        </section>
                    ) : (
                        <>
                            {/* Recently Added Section */}
                            <section className="library-section">
                                <h2 className="section-title">Recently Added</h2>
                                <div className="books-grid">
                                    {recentlyAdded.map(resource => (
                                        <BookCard key={resource.id} resource={resource} />
                                    ))}
                                </div>
                            </section>

                            {/* Recommended Section */}
                            <section className="library-section">
                                <h2 className="section-title">Recommended For You</h2>
                                <div className="books-grid">
                                    {recommended.map(resource => (
                                        <BookCard key={resource.id} resource={resource} />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {resources.length === 0 && (
                        <div className="empty-state">
                            <i className="fa fa-book text-6xl text-gray-300 mb-4"></i>
                            <p>No books available yet. Check back later!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
