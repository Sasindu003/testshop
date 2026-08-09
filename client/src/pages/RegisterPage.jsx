import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-primary">Create an account</h1>
            <p className="text-sm text-secondary font-sans mt-2">Join us and start shopping</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 font-sans">
            <Input
              id="reg-name"
              label="Full Name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              leading={<User size={16} />}
              placeholder="Jane Smith"
            />

            <Input
              id="reg-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              leading={<Mail size={16} />}
              placeholder="you@example.com"
            />

            <Input
              id="reg-phone"
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              leading={<Phone size={16} />}
              placeholder="+94 77 000 0000"
            />

            <Input
              id="reg-password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              hint="Minimum 6 characters."
              leading={<Lock size={16} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              placeholder="••••••••"
            />

            <Input
              id="reg-confirm"
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={errors.confirmPassword}
              leading={<Lock size={16} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              placeholder="••••••••"
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary font-sans">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
