import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/auth';
import { useToast } from '../components/ui/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  // ── Profile fields ───────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
      toast('Profile updated.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password change ──────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required.';
    if (pwForm.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters.';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast('Password changed.', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Address management ───────────────────────────────────────────────────
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [addrLoading, setAddrLoading] = useState(false);
  const emptyAddr = { label: '', line1: '', line2: '', city: '', postalCode: '', country: 'Sri Lanka', isDefault: false };
  const [newAddr, setNewAddr] = useState(emptyAddr);
  const [showAddrForm, setShowAddrForm] = useState(false);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.line1.trim() || !newAddr.city.trim() || !newAddr.postalCode.trim()) {
      toast('Line 1, city, and postal code are required.', 'warning');
      return;
    }
    setAddrLoading(true);
    try {
      const updated = [...addresses, newAddr];
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      setNewAddr(emptyAddr);
      setShowAddrForm(false);
      toast('Address added.', 'success');
    } catch {
      toast('Failed to save address.', 'error');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleRemoveAddress = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      toast('Address removed.', 'info');
    } catch {
      toast('Failed to remove address.', 'error');
    }
  };

  const handleSetDefault = async (idx) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      toast('Default address updated.', 'success');
    } catch {
      toast('Failed to update.', 'error');
    }
  };

  const Section = ({ title, children }) => (
    <section className="border border-border rounded p-6">
      <h2 className="text-lg font-serif text-primary mb-5">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-8 font-sans">
      <h1 className="text-3xl font-serif text-primary">My Profile</h1>

      {/* ── Personal info ────────────────────────────────────────────── */}
      <Section title="Personal Information">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input label="Email" value={user?.email || ''} disabled hint="Email cannot be changed." />
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+94 77 000 0000"
          />
          <Button type="submit" loading={profileLoading} size="sm">Save Changes</Button>
        </form>
      </Section>

      {/* ── Change password ──────────────────────────────────────────── */}
      <Section title="Change Password">
        <form onSubmit={handlePwSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
            error={pwErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            error={pwErrors.newPassword}
            hint="Minimum 6 characters."
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            error={pwErrors.confirmPassword}
          />
          <Button type="submit" loading={pwLoading} size="sm">Change Password</Button>
        </form>
      </Section>

      {/* ── Addresses ───────────────────────────────────────────────── */}
      <Section title="Saved Addresses">
        <div className="space-y-3 mb-4">
          {addresses.length === 0 && (
            <p className="text-sm text-secondary">No saved addresses yet.</p>
          )}
          {addresses.map((addr, idx) => (
            <div key={idx} className={`border rounded p-4 text-sm ${addr.isDefault ? 'border-primary' : 'border-border'}`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  {addr.label && <p className="font-medium text-primary text-xs uppercase tracking-wider mb-1">{addr.label}</p>}
                  <p className="text-primary">{addr.line1}</p>
                  {addr.line2 && <p className="text-secondary">{addr.line2}</p>}
                  <p className="text-secondary">{addr.city}, {addr.postalCode}</p>
                  {addr.country && <p className="text-secondary">{addr.country}</p>}
                  {addr.isDefault && <span className="text-[10px] text-accent font-bold uppercase tracking-wider mt-1 block">Default</span>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(idx)} className="text-xs text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
                      Set default
                    </button>
                  )}
                  <button onClick={() => handleRemoveAddress(idx)} className="text-xs text-error hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAddrForm ? (
          <form onSubmit={handleAddAddress} className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-primary">New Address</h3>
            <Input label="Label" value={newAddr.label} onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))} placeholder="Home, Work…" />
            <Input label="Address Line 1" value={newAddr.line1} onChange={(e) => setNewAddr((a) => ({ ...a, line1: e.target.value }))} required />
            <Input label="Address Line 2" value={newAddr.line2} onChange={(e) => setNewAddr((a) => ({ ...a, line2: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={newAddr.city} onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))} required />
              <Input label="Postal Code" value={newAddr.postalCode} onChange={(e) => setNewAddr((a) => ({ ...a, postalCode: e.target.value }))} required />
            </div>
            <Input label="Country" value={newAddr.country} onChange={(e) => setNewAddr((a) => ({ ...a, country: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
              <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr((a) => ({ ...a, isDefault: e.target.checked }))} className="accent-accent" />
              Set as default
            </label>
            <div className="flex gap-3">
              <Button type="submit" size="sm" loading={addrLoading}>Save Address</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setShowAddrForm(false); setNewAddr(emptyAddr); }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowAddrForm(true)}>+ Add Address</Button>
        )}
      </Section>
    </div>
  );
}
