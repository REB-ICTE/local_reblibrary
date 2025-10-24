import { h } from "preact";
import { useState } from "preact/hooks";
import { ClassService } from "../../services/edu-structure";
import type { EduClass, CreateClassData } from "../../services/edu-structure";
import { sublevelsSignal, classesSignal, loadingSignal, errorSignal, successSignal } from "./EdStructure";

export default function ClassTab() {
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState<EduClass | null>(null);
    const [formData, setFormData] = useState<CreateClassData>({
        class_name: '',
        class_code: '',
        sublevel_id: 0
    });

    const handleAdd = () => {
        setEditingClass(null);
        setFormData({
            class_name: '',
            class_code: '',
            sublevel_id: sublevelsSignal.value[0]?.id || 0
        });
        setShowForm(true);
    };

    const handleEdit = (cls: EduClass) => {
        setEditingClass(cls);
        setFormData({
            class_name: cls.class_name,
            class_code: cls.class_code,
            sublevel_id: cls.sublevel_id
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingClass(null);
        setFormData({ class_name: '', class_code: '', sublevel_id: 0 });
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!formData.class_name.trim() || !formData.class_code.trim()) {
            errorSignal.value = 'Class name and code are required';
            return;
        }

        if (!formData.sublevel_id) {
            errorSignal.value = 'Please select a parent sublevel';
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            if (editingClass) {
                const updated = await ClassService.update(editingClass.id, formData);
                classesSignal.value = classesSignal.value.map(c =>
                    c.id === updated.id ? updated : c
                );
                successSignal.value = 'Class updated successfully';
            } else {
                const created = await ClassService.create(formData);
                classesSignal.value = [...classesSignal.value, created].sort((a, b) =>
                    a.class_code.localeCompare(b.class_code)
                );
                successSignal.value = 'Class created successfully';
            }
            handleCancel();
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const handleDelete = async (cls: EduClass) => {
        if (!confirm(`Are you sure you want to delete "${cls.class_name}"?`)) {
            return;
        }

        loadingSignal.value = true;
        errorSignal.value = null;
        successSignal.value = null;

        try {
            await ClassService.delete(cls.id);
            classesSignal.value = classesSignal.value.filter(c => c.id !== cls.id);
            successSignal.value = 'Class deleted successfully';
        } catch (error: any) {
            errorSignal.value = error.message || 'An error occurred';
        } finally {
            loadingSignal.value = false;
        }
    };

    const getSublevelName = (sublevelId: number) => {
        return sublevelsSignal.value.find(s => s.id === sublevelId)?.sublevel_name || `ID: ${sublevelId}`;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Classes</h2>
                {!showForm && (
                    <button
                        onClick={handleAdd}
                        disabled={sublevelsSignal.value.length === 0}
                        className="bg-reb-blue text-white px-4 py-2 rounded-lg hover:bg-reb-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa fa-plus mr-2"></i>
                        Add Class
                    </button>
                )}
            </div>

            {sublevelsSignal.value.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">
                        <i className="fa fa-exclamation-triangle mr-2"></i>
                        Please create at least one Sublevel before adding classes.
                    </p>
                </div>
            )}

            {showForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingClass ? 'Edit Class' : 'Add Class'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.class_name}
                                onInput={(e) => setFormData({ ...formData, class_name: (e.target as HTMLInputElement).value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                placeholder="e.g., Nursery 1, Primary 4, Senior 6"
                                maxLength={50}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                e.g., "Nursery 1", "Primary 4", "Senior 6"
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.class_code}
                                onInput={(e) => setFormData({ ...formData, class_code: (e.target as HTMLInputElement).value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                placeholder="e.g., N1, P4, S6"
                                maxLength={10}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                A short unique code, e.g., "N1", "P4", "S6"
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parent Sublevel <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.sublevel_id}
                                onChange={(e) => setFormData({ ...formData, sublevel_id: parseInt((e.target as HTMLSelectElement).value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-reb-blue"
                                required
                            >
                                <option value="">-- Select Sublevel --</option>
                                {sublevelsSignal.value.map((sublevel) => (
                                    <option key={sublevel.id} value={sublevel.id}>
                                        {sublevel.sublevel_name}
                                    </option>
                                ))}
                            </select>
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

            {classesSignal.value.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Class Name</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Class Code</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Parent Sublevel</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classesSignal.value.map((cls) => (
                                <tr key={cls.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-600">{cls.id}</td>
                                    <td className="py-3 px-4 text-gray-900 font-medium">{cls.class_name}</td>
                                    <td className="py-3 px-4">
                                        <span className="bg-reb-blue-100 text-reb-blue-800 px-2 py-1 rounded text-sm font-medium">
                                            {cls.class_code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{getSublevelName(cls.sublevel_id)}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(cls)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                        >
                                            <i className="fa fa-edit mr-1"></i>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cls)}
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
                    <i className="fa fa-chalkboard text-4xl mb-4 text-gray-300"></i>
                    <p>No classes defined yet. Click "Add Class" to create one.</p>
                </div>
            )}
        </div>
    );
}
