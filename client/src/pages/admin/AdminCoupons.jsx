import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, CalendarX, CheckCircle, XCircle } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/coupons';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: 0,
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await getCoupons();
      setCoupons(data.data || data.coupons || data || []);
    } catch {
      toast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    setForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrderValue: 0,
      maxUses: '',
      validFrom: now.toISOString().slice(0, 16),
      validUntil: nextWeek.toISOString().slice(0, 16),
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cpn) => {
    setEditingCoupon(cpn);
    setForm({
      code: cpn.code,
      type: cpn.type,
      value: cpn.value,
      minOrderValue: cpn.minOrderValue || 0,
      maxUses: cpn.maxUses || '',
      validFrom: new Date(cpn.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(cpn.validUntil).toISOString().slice(0, 16),
      isActive: cpn.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value || !form.validFrom || !form.validUntil) {
      toast('Please fill all required fields.', 'warning');
      return;
    }

    const validFromDate = new Date(form.validFrom);
    const validUntilDate = new Date(form.validUntil);
    const now = new Date();

    if (validUntilDate <= validFromDate) {
      toast('Valid Until must be after Valid From.', 'warning');
      return;
    }

    if (form.isActive && validUntilDate < now) {
      toast('Cannot set an expired coupon to active. Please extend Valid Until.', 'error');
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      validFrom: validFromDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
    };

    setSubmitting(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        toast('Coupon updated successfully.', 'success');
      } else {
        await createCoupon(payload);
        toast('Coupon created successfully.', 'success');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save coupon.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast('Coupon deactivated.', 'success');
      fetchCoupons();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to deactivate.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Coupons</h1>
          <p className="text-sm text-secondary font-sans mt-1">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} /> New Coupon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 font-sans bg-surface border border-border rounded-lg">
          <Tag size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">No coupons found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Validity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((cpn) => {
                const now = new Date();
                const isExpired = new Date(cpn.validUntil) < now;
                const isFuture = new Date(cpn.validFrom) > now;
                const isMaxedOut = cpn.maxUses !== null && cpn.usedCount >= cpn.maxUses;
                
                let statusColor = '';
                let statusText = '';
                let StatusIcon = null;

                if (!cpn.isActive) {
                  statusColor = 'bg-gray-50 text-gray-700 border-gray-200';
                  statusText = 'Deactivated';
                  StatusIcon = XCircle;
                } else if (isExpired) {
                  statusColor = 'bg-red-50 text-red-700 border-red-200';
                  statusText = 'Expired';
                  StatusIcon = CalendarX;
                } else if (isMaxedOut) {
                  statusColor = 'bg-red-50 text-red-700 border-red-200';
                  statusText = 'Depleted';
                  StatusIcon = XCircle;
                } else if (isFuture) {
                  statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  statusText = 'Scheduled';
                  StatusIcon = CalendarX; // not exact icon but conveys time
                } else {
                  statusColor = 'bg-green-50 text-green-700 border-green-200';
                  statusText = 'Active';
                  StatusIcon = CheckCircle;
                }

                return (
                  <tr key={cpn._id} className={`hover:bg-background/50 transition-colors ${isExpired && cpn.isActive ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-bold text-primary tracking-wider">{cpn.code}</td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {cpn.type === 'percentage' ? `${cpn.value}%` : `$${cpn.value.toFixed(2)}`}
                      {cpn.minOrderValue > 0 && <span className="block text-xs text-secondary font-normal">Min: ${cpn.minOrderValue}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isMaxedOut ? 'bg-error' : 'bg-accent'}`} 
                            style={{ width: cpn.maxUses ? `${Math.min(100, (cpn.usedCount / cpn.maxUses) * 100)}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs text-secondary font-medium whitespace-nowrap">
                          {cpn.usedCount} {cpn.maxUses ? `/ ${cpn.maxUses}` : 'uses'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary whitespace-nowrap">
                      {new Date(cpn.validFrom).toLocaleDateString()} — <br/>
                      <span className={isExpired ? 'text-error font-medium' : ''}>{new Date(cpn.validUntil).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${statusColor}`}>
                        <StatusIcon size={12} />
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(cpn)} className="p-1.5 text-secondary hover:text-primary transition-colors rounded border border-transparent hover:border-border hover:bg-background" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        {cpn.isActive && (
                          <button onClick={() => handleDelete(cpn._id)} className="p-1.5 text-secondary hover:text-error transition-colors rounded border border-transparent hover:border-error/20 hover:bg-error/5" title="Deactivate">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => !submitting && setModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'New Coupon'} className="max-w-xl">
        <form onSubmit={handleSubmit} className="font-sans space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required autoFocus />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-primary">Status</label>
              <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent">
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-primary">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <Input label="Value" type="number" step={form.type === 'fixed' ? '0.01' : '1'} min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order Value ($)" type="number" step="0.01" min="0" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
            <Input label="Max Uses (Leave empty for unlimited)" type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-background p-3 border border-border rounded">
            <Input label="Valid From" type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
            <Input label="Valid Until" type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editingCoupon ? 'Save Changes' : 'Create Coupon'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
