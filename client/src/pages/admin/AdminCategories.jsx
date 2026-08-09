import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Folder } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await getCategories();
      setCategories(data.categories || data.data || []);
    } catch {
      toast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageFile(null);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (imageFile) formData.append('image', imageFile);
    // isActive is true by default for new creations

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
        toast('Category updated', 'success');
      } else {
        await createCategory(formData);
        toast('Category created', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this category? Active products might block this.')) return;
    try {
      await deleteCategory(id);
      toast('Category deactivated', 'success');
      fetchCategories();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Categories</h1>
          <p className="text-sm text-secondary font-sans mt-1">Manage your product catalog structure</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} /> New Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 font-sans bg-surface border border-border rounded-lg shadow-sm">
          <Folder size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">No active categories found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-border bg-background overflow-hidden shrink-0 flex items-center justify-center">
                        {cat.imageFileId ? (
                          <img 
                            src={`${API}/files/${cat.imageFileId}`} 
                            alt={cat.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Folder size={18} className="text-secondary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{cat.name}</p>
                        <p className="text-xs text-secondary">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary truncate max-w-[200px]">
                    {cat.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded border border-transparent hover:border-border hover:bg-background"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 text-secondary hover:text-error transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded border border-transparent hover:border-error/20 hover:bg-error/5"
                        title="Deactivate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => !submitting && setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <Input 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            autoFocus
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary">
              Description (optional)
            </label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-surface hover:file:bg-accent transition"
            />
            {editingCategory?.imageFileId && !imageFile && (
              <p className="text-xs text-secondary mt-1">Current image will be kept if no new file is selected.</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
