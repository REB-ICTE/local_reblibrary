import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import type { Resource } from "../../services/resources";
import type { Author } from "../../services/authors";
import { ResourceService, CreateResourceData, UpdateResourceData } from "../../services/resources";
import { AuthorService, CreateAuthorData, UpdateAuthorData } from "../../services/authors";
import Sidebar from "../shared/Sidebar";
import Toast from "../shared/Toast";
import { getAdminMenuItems } from "../../config/admin-menu";
import { getLibraryMenuItems } from "../../config/library-menu";

// Signals for state management
export const resourcesSignal = signal<Resource[]>([]);
export const authorsSignal = signal<Author[]>([]);
export const loadingSignal = signal<boolean>(false);
export const errorSignal = signal<string | null>(null);
export const successSignal = signal<string | null>(null);

interface ResourcesProps {
    initialResources: Resource[];
    initialAuthors: Author[];
}

type Tab = 'resources' | 'authors';

export default function Resources({ initialResources, initialAuthors }: ResourcesProps) {
    // Initialize signals with data from PHP
    useEffect(() => {
        resourcesSignal.value = initialResources;
        authorsSignal.value = initialAuthors;
    }, [initialResources, initialAuthors]);

    // Menu items
    const libraryMenuItems = getLibraryMenuItems();
    const adminMenuItems = getAdminMenuItems('resources');

    const [activeTab, setActiveTab] = useState<Tab>('resources');
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    const [resourceFormData, setResourceFormData] = useState<CreateResourceData>({
        title: '',
        isbn: '',
        author_id: 0,
        description: '',
        cover_image_url: '',
        file_url: '',
    });

    const [authorFormData, setAuthorFormData] = useState<CreateAuthorData>({
        first_name: '',
        last_name: '',
        bio: '',
    });

    // Resource handlers
    const handleAddResource = () => {
        setEditingResource(null);
        setResourceFormData({
            title: '',
            isbn: '',
            author_id: authorsSignal.value.length > 0 ? authorsSignal.value[0].id : 0,
            description: '',
            cover_image_url: '',
            file_url: '',
        });
        setShowResourceForm(true);
    };

    const handleEditResource = (resource: Resource) => {
        setEditingResource(resource);
        setResourceFormData({
            title: resource.title,
            isbn: resource.isbn || '',
            author_id: resource.author_id,
            description: resource.description || '',
            cover_image_url: resource.cover_image_url || '',
            file_url: resource.file_url || '',
        });
        setShowResourceForm(true);
    };

    const handleCancelResource = () => {
        setShowResourceForm(false);
        setEditingResource(null);
    };

    const handleSubmitResource = async (e: Event) => {
        e.preventDefault();

        if (!resourceFormData.title.trim()) {
            errorSignal.value = 'Resource title is required';
            return;
        }

        if (!resourceFormData.author_id) {
            errorSignal.value = 'Please select an author';
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            if (editingResource) {
                const updateData: UpdateResourceData = {
                    title: resourceFormData.title,
                    isbn: resourceFormData.isbn,
                    author_id: resourceFormData.author_id,
                    description: resourceFormData.description,
                    cover_image_url: resourceFormData.cover_image_url,
                    file_url: resourceFormData.file_url,
                };
                const updated = await ResourceService.update(editingResource.id, updateData);
                resourcesSignal.value = resourcesSignal.value.map(r =>
                    r.id === updated.id ? updated : r
                );
                successSignal.value = 'Resource updated successfully';
            } else {
                const created = await ResourceService.create(resourceFormData);
                resourcesSignal.value = [created, ...resourcesSignal.value];
                successSignal.value = 'Resource created successfully';
            }
            handleCancelResource();
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const handleDeleteResource = async (resource: Resource) => {
        if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) {
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            await ResourceService.delete(resource.id);
            resourcesSignal.value = resourcesSignal.value.filter(r => r.id !== resource.id);
            successSignal.value = 'Resource deleted successfully';
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    // Author handlers
    const handleAddAuthor = () => {
        setEditingAuthor(null);
        setAuthorFormData({
            first_name: '',
            last_name: '',
            bio: '',
        });
        setShowAuthorForm(true);
    };

    const handleEditAuthor = (author: Author) => {
        setEditingAuthor(author);
        setAuthorFormData({
            first_name: author.first_name,
            last_name: author.last_name,
            bio: author.bio || '',
        });
        setShowAuthorForm(true);
    };

    const handleCancelAuthor = () => {
        setShowAuthorForm(false);
        setEditingAuthor(null);
    };

    const handleSubmitAuthor = async (e: Event) => {
        e.preventDefault();

        if (!authorFormData.first_name.trim() || !authorFormData.last_name.trim()) {
            errorSignal.value = 'First name and last name are required';
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            if (editingAuthor) {
                const updateData: UpdateAuthorData = {
                    first_name: authorFormData.first_name,
                    last_name: authorFormData.last_name,
                    bio: authorFormData.bio,
                };
                const updated = await AuthorService.update(editingAuthor.id, updateData);
                authorsSignal.value = authorsSignal.value.map(a =>
                    a.id === updated.id ? updated : a
                );
                successSignal.value = 'Author updated successfully';
            } else {
                const created = await AuthorService.create(authorFormData);
                authorsSignal.value = [...authorsSignal.value, created].sort((a, b) =>
                    `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
                );
                successSignal.value = 'Author created successfully';
            }
            handleCancelAuthor();
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const handleDeleteAuthor = async (author: Author) => {
        if (!confirm(`Are you sure you want to delete "${author.first_name} ${author.last_name}"?`)) {
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            await AuthorService.delete(author.id);
            authorsSignal.value = authorsSignal.value.filter(a => a.id !== author.id);
            successSignal.value = 'Author deleted successfully';
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const getAuthorName = (authorId: number) => {
        const author = authorsSignal.value.find(a => a.id === authorId);
        return author ? `${author.first_name} ${author.last_name}` : `Unknown (ID: ${authorId})`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar adminMenuItems={adminMenuItems} libraryMenuItems={libraryMenuItems} />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Resources & Authors Management
                    </h1>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`px-6 py-3 font-medium transition-colors ${
                                activeTab === 'resources'
                                    ? 'border-b-2 border-reb-blue text-reb-blue'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Resources
                        </button>
                        <button
                            onClick={() => setActiveTab('authors')}
                            className={`px-6 py-3 font-medium transition-colors ${
                                activeTab === 'authors'
                                    ? 'border-b-2 border-reb-blue text-reb-blue'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Authors
                        </button>
                    </div>

                    {/* Resources Tab Content */}
                    {activeTab === 'resources' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            {showResourceForm ? (
                                <>
                                    {/* Back Button */}
                                    <button
                                        onClick={handleCancelResource}
                                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                                    >
                                        <i className="fa fa-arrow-left mr-2"></i>
                                        Back to Resources
                                    </button>

                                    {/* Form Only */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {editingResource ? 'Edit Resource' : 'Add Resource'}
                                        </h3>
                                        <form onSubmit={handleSubmitResource}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={resourceFormData.title}
                                                        onInput={(e) => setResourceFormData({ ...resourceFormData, title: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="Resource title"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        ISBN
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={resourceFormData.isbn}
                                                        onInput={(e) => setResourceFormData({ ...resourceFormData, isbn: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="ISBN (optional)"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Author <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={resourceFormData.author_id}
                                                        onChange={(e) => setResourceFormData({ ...resourceFormData, author_id: parseInt((e.target as HTMLSelectElement).value) })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        required
                                                    >
                                                        <option value="">-- Select Author --</option>
                                                        {authorsSignal.value.map((author) => (
                                                            <option key={author.id} value={author.id}>
                                                                {author.first_name} {author.last_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cover Image URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={resourceFormData.cover_image_url}
                                                        onInput={(e) => setResourceFormData({ ...resourceFormData, cover_image_url: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="https://example.com/cover.jpg"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        File URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={resourceFormData.file_url}
                                                        onInput={(e) => setResourceFormData({ ...resourceFormData, file_url: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="https://example.com/resource.pdf"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={resourceFormData.description}
                                                        onInput={(e) => setResourceFormData({ ...resourceFormData, description: (e.target as HTMLTextAreaElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="Resource description"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex space-x-3 mt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loadingSignal.value}
                                                    className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {loadingSignal.value ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelResource}
                                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Header with Add Button */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Library Resources</h2>
                                        <button
                                            onClick={handleAddResource}
                                            className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors"
                                            disabled={authorsSignal.value.length === 0}
                                        >
                                            <i className="fa fa-plus mr-2"></i>
                                            Add Resource
                                        </button>
                                    </div>

                                    {authorsSignal.value.length === 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                            <p className="text-yellow-700">
                                                <i className="fa fa-exclamation-triangle mr-2"></i>
                                                Please add at least one author before creating resources.
                                                Switch to the "Authors" tab to add authors.
                                            </p>
                                        </div>
                                    )}

                                    {/* Table View */}
                                    {resourcesSignal.value.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">ISBN</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Author</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resourcesSignal.value.map((resource) => (
                                                <tr key={resource.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-600">{resource.id}</td>
                                                    <td className="py-3 px-4 text-gray-900 font-medium">{resource.title}</td>
                                                    <td className="py-3 px-4 text-gray-600 text-sm">{resource.isbn || '-'}</td>
                                                    <td className="py-3 px-4 text-gray-700">{getAuthorName(resource.author_id)}</td>
                                                    <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(resource.created_at)}</td>
                                                    <td className="py-3 px-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleEditResource(resource)}
                                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                                        >
                                                            <i className="fa fa-edit mr-1"></i>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteResource(resource)}
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                                                        >
                                                            <i className="fa fa-trash mr-1"></i>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <i className="fa fa-book text-4xl mb-4 text-gray-300"></i>
                                            <p>No resources found. Click "Add Resource" to create one.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Authors Tab Content */}
                    {activeTab === 'authors' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            {showAuthorForm ? (
                                <>
                                    {/* Back Button */}
                                    <button
                                        onClick={handleCancelAuthor}
                                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                                    >
                                        <i className="fa fa-arrow-left mr-2"></i>
                                        Back to Authors
                                    </button>

                                    {/* Form Only */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {editingAuthor ? 'Edit Author' : 'Add Author'}
                                        </h3>
                                        <form onSubmit={handleSubmitAuthor}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        First Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={authorFormData.first_name}
                                                        onInput={(e) => setAuthorFormData({ ...authorFormData, first_name: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="First name"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={authorFormData.last_name}
                                                        onInput={(e) => setAuthorFormData({ ...authorFormData, last_name: (e.target as HTMLInputElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="Last name"
                                                        required
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Bio
                                                    </label>
                                                    <textarea
                                                        value={authorFormData.bio}
                                                        onInput={(e) => setAuthorFormData({ ...authorFormData, bio: (e.target as HTMLTextAreaElement).value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                                        placeholder="Author biography (optional)"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex space-x-3 mt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loadingSignal.value}
                                                    className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {loadingSignal.value ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelAuthor}
                                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Header with Add Button */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Authors</h2>
                                        <button
                                            onClick={handleAddAuthor}
                                            className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors"
                                        >
                                            <i className="fa fa-plus mr-2"></i>
                                            Add Author
                                        </button>
                                    </div>

                                    {/* Table View */}
                                    {authorsSignal.value.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Bio</th>
                                                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {authorsSignal.value.map((author) => (
                                                        <tr key={author.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                            <td className="py-3 px-4 text-gray-600">{author.id}</td>
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {author.first_name} {author.last_name}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                                {author.bio ? (
                                                                    <span className="line-clamp-2">{author.bio}</span>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="py-3 px-4 text-right space-x-2">
                                                                <button
                                                                    onClick={() => handleEditAuthor(author)}
                                                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                                                >
                                                                    <i className="fa fa-edit mr-1"></i>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAuthor(author)}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                                                                >
                                                                    <i className="fa fa-trash mr-1"></i>
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <i className="fa fa-user text-4xl mb-4 text-gray-300"></i>
                                            <p>No authors found. Click "Add Author" to create one.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notifications */}
            {successSignal.value && (
                <Toast
                    message={successSignal.value}
                    type="success"
                    onClose={() => successSignal.value = null}
                />
            )}
            {errorSignal.value && (
                <Toast
                    message={errorSignal.value}
                    type="error"
                    onClose={() => errorSignal.value = null}
                />
            )}
        </div>
    );
}
