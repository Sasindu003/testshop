import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon, X } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminProducts() {
  const { toast } = useToast();
  
  // Products table state
  const fetcher = useCallback((params) => getProducts(params), []);
  const { data: products, meta, loading, error, fetch } = usePagination(fetcher, {}, 10);
  
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
  });
  
  const [sizes, setSizes] = useState([]); // { size, stock, priceOverride }
  
  const [discount, setDiscount] = useState({
    enabled: false,
    type: 'percentage',
    value: '',
    activeFrom: '',
    activeUntil: ''
  });
  
  const [existingImages, setExistingImages] = useState([]); // string array of IDs
  const [newImages, setNewImages] = useState([]); // File array

  useEffect(() => {
    fetch(1, categoryFilter ? { category: categoryFilter } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data.categories || res.data.data || []);
    });
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', category: categories[0]?._id || '', basePrice: '' });
    setSizes([{ size: 'M', stock: 10 }]);
    setDiscount({ enabled: false, type: 'percentage', value: '', activeFrom: '', activeUntil: '' });
    setExistingImages([]);
    setNewImages([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      description: prod.description || '',
      category: prod.category?._id || prod.category,
      basePrice: prod.basePrice || '',
    });
    setSizes(prod.sizes?.length ? [...prod.sizes] : [{ size: 'M', stock: 0 }]);
    
    if (prod.discount?.activeFrom) {
      setDiscount({
        enabled: true,
        type: prod.discount.type,
        value: prod.discount.value,
        activeFrom: new Date(prod.discount.activeFrom).toISOString().slice(0, 16),
        activeUntil: new Date(prod.discount.activeUntil).toISOString().slice(0, 16)
      });
    } else {
      setDiscount({ enabled: false, type: 'percentage', value: '', activeFrom: '', activeUntil: '' });
    }
    
    setExistingImages(prod.imageFileIds || []);
    setNewImages([]);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (existingImages.length + newImages.length + selected.length > 5) {
        toast('Maximum 5 images allowed per product.', 'warning');
        return;
      }
      setNewImages([...newImages, ...selected]);
    }
  };

  const handleRemoveExistingImage = (id) => {
    setExistingImages(existingImages.filter(imgId => imgId !== id));
  };
  
  const handleRemoveNewImage = (idx) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.basePrice) {
      toast('Name, Category, and Base Price are required.', 'warning');
      return;
    }
    if (sizes.length === 0) {
      toast('At least one size with stock is required.', 'warning');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('basePrice', form.basePrice);
    formData.append('sizes', JSON.stringify(sizes));

    if (discount.enabled && discount.value && discount.activeFrom && discount.activeUntil) {
      formData.append('discount', JSON.stringify({
        type: discount.type,
        value: Number(discount.value),
        activeFrom: new Date(discount.activeFrom).toISOString(),
        activeUntil: new Date(discount.activeUntil).toISOString()
      }));
    } else {
      formData.append('discount', JSON.stringify(null)); // Clear discount
    }

    if (editingProduct) {
      formData.append('keepImageIds', JSON.stringify(existingImages));
    }

    newImages.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        toast('Product updated successfully', 'success');
      } else {
        await createProduct(formData);
        toast('Product created successfully', 'success');
      }
      setModalOpen(false);
      fetch(meta.currentPage, categoryFilter ? { category: categoryFilter } : {});
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await deleteProduct(id);
      toast('Product deactivated', 'success');
      fetch(meta.currentPage, categoryFilter ? { category: categoryFilter } : {});
    } catch (err) {
      toast('Failed to deactivate product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Products</h1>
          <p className="text-sm text-secondary font-sans mt-1">Manage your catalog, stock, and pricing</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} /> New Product
        </Button>
      </div>

      <div className="flex gap-4 font-sans mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-border rounded px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && !products ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-10 text-error font-sans border border-error/20 bg-error/5 rounded">{error}</div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 font-sans bg-surface border border-border rounded-lg shadow-sm">
          <ShoppingBag size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">No products found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Total Stock</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.map((prod) => {
                const totalStock = prod.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
                const img = prod.imageFileIds?.[0] ? `${API}/files/${prod.imageFileIds[0]}` : null;
                return (
                  <tr key={prod._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded border border-border bg-background overflow-hidden shrink-0 flex items-center justify-center">
                          {img ? <img src={img} alt={prod.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-secondary" />}
                        </div>
                        <div>
                          <p className="font-medium text-primary line-clamp-1">{prod.name}</p>
                          {prod.discount && new Date() >= new Date(prod.discount.activeFrom) && new Date() <= new Date(prod.discount.activeUntil) && (
                            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Sale</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{prod.category?.name}</td>
                    <td className="px-4 py-3 text-primary font-medium">${prod.basePrice?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${totalStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(prod)} className="p-1.5 text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded border border-transparent hover:border-border hover:bg-background"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(prod._id)} className="p-1.5 text-secondary hover:text-error transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded border border-transparent hover:border-error/20 hover:bg-error/5"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {meta?.totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-center">
              <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={(p) => fetch(p, categoryFilter ? { category: categoryFilter } : {})} />
            </div>
          )}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => !submitting && setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'New Product'} className="max-w-3xl w-full">
        <form onSubmit={handleSubmit} className="font-sans space-y-6 max-h-[70vh] overflow-y-auto px-1">
          
          {/* General */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border pb-2">General Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-primary">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent">
                  <option value="" disabled>Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-primary">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent" />
            </div>
            <Input label="Base Price ($)" type="number" step="0.01" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
          </section>

          {/* Sizes & Stock */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border pb-2 flex justify-between items-center">
              Sizes & Stock
              <button type="button" onClick={() => setSizes([...sizes, { size: '', stock: 0 }])} className="text-xs text-primary underline hover:text-accent font-medium">Add Size</button>
            </h3>
            {sizes.map((s, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <Input label={idx === 0 ? "Size" : ""} value={s.size} onChange={(e) => { const ns = [...sizes]; ns[idx].size = e.target.value; setSizes(ns); }} placeholder="S, M, L, 42..." required />
                <Input label={idx === 0 ? "Stock" : ""} type="number" min="0" value={s.stock} onChange={(e) => { const ns = [...sizes]; ns[idx].stock = parseInt(e.target.value, 10); setSizes(ns); }} required />
                {sizes.length > 1 && (
                  <button type="button" onClick={() => setSizes(sizes.filter((_, i) => i !== idx))} className={`shrink-0 p-2 text-error hover:bg-error/10 rounded ${idx === 0 ? 'mt-6' : ''}`}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Discount */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <input type="checkbox" checked={discount.enabled} onChange={(e) => setDiscount({ ...discount, enabled: e.target.checked })} className="accent-accent" />
              Active Discount
            </h3>
            {discount.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background p-4 rounded border border-border">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-primary">Type</label>
                  <select value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <Input label="Value" type="number" step="0.01" min="0" value={discount.value} onChange={(e) => setDiscount({ ...discount, value: e.target.value })} required />
                <Input label="Active From" type="datetime-local" value={discount.activeFrom} onChange={(e) => setDiscount({ ...discount, activeFrom: e.target.value })} required />
                <Input label="Active Until" type="datetime-local" value={discount.activeUntil} onChange={(e) => setDiscount({ ...discount, activeUntil: e.target.value })} required />
              </div>
            )}
          </section>

          {/* Images */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b border-border pb-2">
              Images (Max 5)
            </h3>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((id) => (
                <div key={id} className="relative w-20 h-24 border border-border rounded overflow-hidden group">
                  <img src={`${API}/files/${id}`} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveExistingImage(id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {newImages.map((file, idx) => (
                <div key={idx} className="relative w-20 h-24 border border-accent border-dashed rounded overflow-hidden group bg-accent/5">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover opacity-70" />
                  <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {existingImages.length + newImages.length < 5 && (
                <label className="w-20 h-24 border border-border border-dashed rounded flex flex-col items-center justify-center text-secondary hover:text-primary hover:border-primary cursor-pointer transition-colors bg-background">
                  <Plus size={20} className="mb-1" />
                  <span className="text-[10px] font-semibold uppercase">Add</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </section>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
