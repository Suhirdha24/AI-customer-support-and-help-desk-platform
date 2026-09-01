import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import { Modal } from '../../components/Modal.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { Category } from '../../types/index.js';
import { Plus } from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await apiClient.post('/admin/categories', { name, description });
      if (res.data.success) {
        toast.success('Category created successfully');
        setShowModal(false);
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await apiClient.put(`/admin/categories/${cat.id}`, {
        isActive: !cat.isActive,
      });
      if (res.data.success) {
        toast.success(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`);
        fetchCategories();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update category');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Taxonomy</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Ticket Categories
          </h2>
          <p className="text-sm text-slate-500">
            Define routing taxonomies used for classification and AI auto-tagging.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs">{cat.name}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">{cat.description || '—'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {cat.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          cat.isActive
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {cat.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Ticket Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication & SSO"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what inquiries belong to this category..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
