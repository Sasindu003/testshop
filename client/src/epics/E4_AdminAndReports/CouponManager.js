import React, { useState, useEffect, useContext } from 'react';
import { getCouponsApi, createCouponApi } from '../../api/adminApi';
import { AuthContext } from '../../context/AuthContext';
import { Tag, Plus, Check } from 'lucide-react';

export default function CouponManager() {
  const { token } = useContext(AuthContext);
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountPercentage: 25, minPurchase: 50 });

  const loadCoupons = () => {
    getCouponsApi(token).then(res => {
      if (res.success) setCoupons(res.coupons);
    });
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createCouponApi(token, { ...formData, discountPercentage: Number(formData.discountPercentage) });
    if (res.success) {
      setShowModal(false);
      loadCoupons();
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-slate-900" /> Promo Coupons & Discounts Engine
        </h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl gradient-button text-xs font-bold text-white flex items-center gap-1">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900 uppercase font-mono font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount %</label>
              <input type="number" required value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl gradient-button text-xs text-white font-bold">Save Coupon</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between items-center">
            <div>
              <span className="text-base font-extrabold font-mono text-blue-900">{c.code}</span>
              <p className="text-xs text-blue-700 font-bold">{c.discountPercentage}% OFF Discount</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
}
