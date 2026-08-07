import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Gem, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const isValidEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail) {
      setError('Please enter a valid email address format (e.g. name@example.com).');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white text-slate-900 animate-fade-in relative">
      
      {/* Back to Store Top Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-30 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: 100% Full-Screen Height Editorial Banner */}
        <div className="relative min-h-screen p-12 bg-slate-900 text-white flex flex-col justify-between hidden md:flex overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200" 
            alt="ShopLarvo Haute Couture" 
            className="absolute inset-0 w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <div className="relative z-10 space-y-3 pt-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold uppercase tracking-widest border border-white/20">
              <Gem className="w-4 h-4" /> HAUTE COUTURE 2026
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              ELEVATE YOUR <br/><span className="text-sky-400">PERSONAL STYLE</span>
            </h1>
          </div>

          <div className="relative z-10 space-y-3 pb-6">
            <p className="text-xs lg:text-sm text-slate-200 font-light leading-relaxed max-w-md">
              Access your saved wishlist items, track live orders, and unlock AI outfit stylist recommendations.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <span>✓ 256-Bit SSL Encrypted Authentication</span>
            </div>
          </div>
        </div>

        {/* Right Side: 100% Full-Screen Height Form Container */}
        <div className="min-h-screen p-8 md:p-16 flex flex-col justify-center bg-white space-y-8 overflow-y-auto">
          
          <div className="max-w-md mx-auto w-full space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-widest border border-slate-200 mb-3">
                CUSTOMER SIGN IN
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your credentials to access your ShopLarvo account</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                      email ? (isValidEmail ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200'
                    }`}
                  />
                </div>
                {email && !isValidEmail && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">✗ Enter valid email format: name@example.com</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 px-4 font-extrabold text-xs uppercase tracking-widest text-white rounded-2xl gradient-button flex items-center justify-center gap-2 shadow-xl"
              >
                {loading ? 'Authenticating...' : <>SIGN IN TO ACCOUNT <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 pt-2">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-slate-900 font-extrabold hover:underline">
                Create New Account
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
