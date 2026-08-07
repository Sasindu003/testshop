import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Plus, Edit2, Check, Trash2, X } from 'lucide-react';

export default function AddressManager() {
  const { user, token } = useContext(AuthContext);
  const [addresses, setAddresses] = useState(user?.addresses || [
    {
      _id: 'addr_1',
      street: '45 Galle Road',
      city: 'Colombo 03',
      state: 'Western Province',
      zipCode: '00300',
      country: 'Sri Lanka',
      isDefault: true
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka'
  });

  const handleOpenAdd = () => {
    setEditingAddr(null);
    setFormData({ street: '', city: '', state: '', zipCode: '', country: 'Sri Lanka' });
    setShowAdd(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddr(addr);
    setFormData({
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      zipCode: addr.zipCode || '',
      country: addr.country || 'Sri Lanka'
    });
    setShowAdd(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (editingAddr) {
      setAddresses(addresses.map(a => a._id === editingAddr._id ? { ...a, ...formData } : a));
    } else {
      const created = { _id: 'addr_' + Date.now(), ...formData, isDefault: addresses.length === 0 };
      setAddresses([...addresses, created]);
    }
    setShowAdd(false);
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a._id === id })));
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-6 shadow-sm text-slate-900">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-900" /> Customer Shipping Address Book
        </h3>
        <button 
          onClick={handleOpenAdd} 
          className="px-3 py-1.5 rounded-xl gradient-button text-xs font-bold text-white flex items-center gap-1 shadow"
        >
          <Plus className="w-3.5 h-3.5" /> Add Address
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSaveAddress} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900">{editingAddr ? 'Edit Shipping Address' : 'Add New Shipping Address'}</h4>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Street Address</label>
            <input 
              type="text" required value={formData.street} 
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">City</label>
              <input 
                type="text" required value={formData.city} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Country</label>
              <input 
                type="text" required value={formData.country} 
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
              {editingAddr ? 'Update Address' : 'Save Address'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div 
            key={addr._id} 
            className={`p-4 rounded-2xl border transition-all text-xs space-y-1 ${
              addr.isDefault 
                ? 'bg-blue-50 border-blue-200 text-slate-900' 
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                {addr.street}
                {addr.isDefault && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-extrabold uppercase">
                    Default Shipping
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(addr)} className="text-slate-500 hover:text-slate-900 p-1" title="Edit Address">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-600">{addr.city}, {addr.state} {addr.zipCode}</p>
            <p className="text-slate-500 font-medium">{addr.country}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
