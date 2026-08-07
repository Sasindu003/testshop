import React, { useState, useEffect, useContext } from 'react';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../api/productApi';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Tag, DollarSign, Check, AlertCircle } from 'lucide-react';

export default function ManageProducts() {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Streetwear & Hoodies',
    stockCount: 10,
    image: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black']
  });

  const loadProducts = () => {
    setLoading(true);
    fetchProductsApi()
      .then(res => {
        if (res.success) setProducts(res.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Streetwear & Hoodies',
      stockCount: 10,
      image: '',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      stockCount: product.stockCount,
      image: product.image || (product.images ? product.images[0] : ''),
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black']
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stockCount: Number(formData.stockCount),
      images: [formData.image]
    };

    if (editingId) {
      const res = await updateProductApi(token, editingId, payload);
      if (res.success) {
        setShowModal(false);
        loadProducts();
      }
    } else {
      const res = await createProductApi(token, payload);
      if (res.success) {
        setShowModal(false);
        loadProducts();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product from MongoDB?')) {
      const res = await deleteProductApi(token, id);
      if (res.success) {
        loadProducts();
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-slate-200 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0f172a]" /> Product & Inventory Manager (Epic 2)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage clothing catalog, stock levels, and price tags in MongoDB Atlas</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold text-white flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add New Apparel Item
        </button>
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            {editingId ? 'Edit Apparel Product' : 'Add New Clothing Product'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input 
                type="text" required value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Cyberpunk Oversized Hoodie"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="Streetwear & Hoodies">Streetwear & Hoodies</option>
                <option value="Formal & Suits">Formal & Suits</option>
                <option value="Casual Apparel & Tees">Casual Apparel & Tees</option>
                <option value="Selvedge Denim & Jeans">Selvedge Denim & Jeans</option>
                <option value="Luxury Accessories & Caps">Luxury Accessories & Caps</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
              <input 
                type="number" required value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="85.00"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Count</label>
              <input 
                type="number" required value={formData.stockCount} 
                onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                placeholder="10"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
              <input 
                type="text" required value={formData.image} 
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-5 py-2 rounded-xl gradient-button text-xs text-white font-bold">
              Save Product
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl bg-slate-200 text-xs font-bold text-slate-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Loading catalog from MongoDB Atlas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={item.image || (item.images ? item.images[0] : '')} alt={item.title} className="w-10 h-10 rounded-lg object-cover border" />
                    <span className="font-bold text-slate-900">{item.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.category}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">${Number(item.price).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.stockCount <= 5 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.stockCount} in stock
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-600 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
