import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-primary">Welcome back</h1>
            <p className="text-sm text-secondary font-sans mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 font-sans">
            <Input
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
              leading={<Mail size={16} />}
              placeholder="you@example.com"
            />

            <div>
              <Input
                id="login-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                error={errors.password}
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
              <div className="mt-1 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary font-sans">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-medium hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
