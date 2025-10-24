import { h } from "preact";
import { useState } from "preact/hooks";
import { LevelService } from "../../services/edu-structure";
import type { EduLevel, CreateLevelData } from "../../services/edu-structure";
import { levelsSignal, loadingSignal, errorSignal, successSignal } from "./EdStructure";

export default function LevelTab() {
    const [showForm, setShowForm] = useState(false);
    const [editingLevel, setEditingLevel] = useState<EduLevel | null>(null);
    const [formData, setFormData] = useState<CreateLevelData>({ level_name: '' });

    const handleAdd = () => {
        setEditingLevel(null);
        setFormData({ level_name: '' });
        setShowForm(true);
    };

    const handleEdit = (level: EduLevel) => {
        setEditingLevel(level);
        setFormData({ level_name: level.level_name });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingLevel(null);
        setFormData({ level_name: '' });
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!formData.level_name.trim()) {
            errorSignal.value = 'Level name is required';
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            if (editingLevel) {
                // Update
                const updated = await LevelService.update(editingLevel.id, formData);
                levelsSignal.value = levelsSignal.value.map(l =>
                    l.id === updated.id ? updated : l
                );
                successSignal.value = 'Education level updated successfully';
            } else {
                // Create
                const created = await LevelService.create(formData);
                levelsSignal.value = [...levelsSignal.value, created].sort((a, b) =>
                    a.level_name.localeCompare(b.level_name)
                );
                successSignal.value = 'Education level created successfully';
            }
            handleCancel();
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const handleDelete = async (level: EduLevel) => {
        if (!confirm(`Are you sure you want to delete "${level.level_name}"?`)) {
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            await LevelService.delete(level.id);
            levelsSignal.value = levelsSignal.value.filter(l => l.id !== level.id);
            successSignal.value = 'Education level deleted successfully';
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Education Levels</h2>
                {!showForm && (
                    <button
                        onClick={handleAdd}
                        className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors"
                    >
                        <i className="fa fa-plus mr-2"></i>
                        Add Level
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingLevel ? 'Edit Education Level' : 'Add Education Level'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Level Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.level_name}
                                onInput={(e) => setFormData({ ...formData, level_name: (e.target as HTMLInputElement).value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                placeholder="e.g., Pre-primary, Primary, Secondary"
                                maxLength={50}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                e.g., "Pre-primary", "Primary", "Secondary"
                            </p>
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

            {levelsSignal.value.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Level Name</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levelsSignal.value.map((level) => (
                                <tr key={level.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-600">{level.id}</td>
                                    <td className="py-3 px-4 text-gray-900 font-medium">{level.level_name}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(level)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                        >
                                            <i className="fa fa-edit mr-1"></i>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(level)}
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
                    <i className="fa fa-graduation-cap text-4xl mb-4 text-gray-300"></i>
                    <p>No education levels defined yet. Click "Add Level" to create one.</p>
                </div>
            )}
        </div>
    );
}
