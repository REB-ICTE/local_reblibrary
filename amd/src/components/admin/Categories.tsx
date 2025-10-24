import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import type { Category } from "../../services/categories";
import { CategoryService, CreateCategoryData } from "../../services/categories";
import Sidebar from "../shared/Sidebar";
import { getAdminMenuItems } from "../../config/admin-menu";
import { getLibraryMenuItems } from "../../config/library-menu";

// Signals for state management
export const categoriesSignal = signal<Category[]>([]);
export const loadingSignal = signal<boolean>(false);
export const errorSignal = signal<string | null>(null);
export const successSignal = signal<string | null>(null);

interface CategoriesProps {
    initialCategories: Category[];
}

export default function Categories({ initialCategories }: CategoriesProps) {
    // Initialize signals with data from PHP
    useEffect(() => {
        categoriesSignal.value = initialCategories;
    }, [initialCategories]);

    // Menu items
    const libraryMenuItems = getLibraryMenuItems();
    const adminMenuItems = getAdminMenuItems('categories');

    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CreateCategoryData>({
        category_name: '',
        parent_category_id: null,
        description: '',
    });

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({ category_name: '', parent_category_id: null, description: '' });
        setShowForm(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            category_name: category.category_name,
            parent_category_id: category.parent_category_id,
            description: category.description,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ category_name: '', parent_category_id: null, description: '' });
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            errorSignal.value = 'Category name is required';
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            if (editingCategory) {
                const updated = await CategoryService.update(editingCategory.id, formData);
                categoriesSignal.value = categoriesSignal.value.map(c =>
                    c.id === updated.id ? updated : c
                );
                successSignal.value = 'Category updated successfully';
            } else {
                const created = await CategoryService.create(formData);
                categoriesSignal.value = [...categoriesSignal.value, created].sort((a, b) =>
                    a.category_name.localeCompare(b.category_name)
                );
                successSignal.value = 'Category created successfully';
            }
            handleCancel();
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const handleDelete = async (category: Category) => {
        if (!confirm(`Are you sure you want to delete "${category.category_name}"?`)) {
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            await CategoryService.delete(category.id);
            categoriesSignal.value = categoriesSignal.value.filter(c => c.id !== category.id);
            successSignal.value = 'Category deleted successfully';
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const getCategoryName = (categoryId: number | null) => {
        if (!categoryId) return 'None (Top-level)';
        return categoriesSignal.value.find(c => c.id === categoryId)?.category_name || `ID: ${categoryId}`;
    };

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
                        Categories Management
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

                    {/* Main Content Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Resource Categories</h2>
                            {!showForm && (
                                <button
                                    onClick={handleAdd}
                                    className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors"
                                >
                                    <i className="fa fa-plus mr-2"></i>
                                    Add Category
                                </button>
                            )}
                        </div>

                        {showForm && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.category_name}
                                            onInput={(e) => setFormData({ ...formData, category_name: (e.target as HTMLInputElement).value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                            placeholder="e.g., Physics, History, Mathematics"
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parent Category
                                        </label>
                                        <select
                                            value={formData.parent_category_id ?? ''}
                                            onChange={(e) => setFormData({ ...formData, parent_category_id: (e.target as HTMLSelectElement).value ? parseInt((e.target as HTMLSelectElement).value) : null })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                        >
                                            <option value="">-- None (Top-level) --</option>
                                            {categoriesSignal.value.filter(c => c.id !== editingCategory?.id).map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.category_name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Leave empty for top-level category
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onInput={(e) => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                            placeholder="Optional description of the category"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            disabled={loadingSignal.value}
                                            className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loadingSignal.value ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {categoriesSignal.value.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Category Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Parent Category</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoriesSignal.value.map((category) => (
                                            <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-600">{category.id}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium">{category.category_name}</td>
                                                <td className="py-3 px-4 text-gray-700">{getCategoryName(category.parent_category_id)}</td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{category.description || '-'}</td>
                                                <td className="py-3 px-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                                    >
                                                        <i className="fa fa-edit mr-1"></i>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category)}
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
                                <i className="fa fa-tags text-4xl mb-4 text-gray-300"></i>
                                <p>No categories defined yet. Click "Add Category" to create one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
