import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, User, Mail, Lock, Phone, MapPin, ArrowRight, Check, AlertCircle, ShieldCheck, Gem, ArrowLeft, Crown, Award, Truck, Gift } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    secondaryPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Field Validations
  const isValidName = /^[a-zA-Z\s]{2,50}$/.test(formData.name.trim());
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const phoneRegex = /^(\+?[1-9]\d{8,14}|(?:\+94|0)?7[0-9]{8})$/;
  const cleanedPrimary = formData.phone.replace(/[\s\-\(\)]/g, '');
  const isValidPrimaryPhone = phoneRegex.test(cleanedPrimary);
  
  const cleanedSecondary = formData.secondaryPhone.replace(/[\s\-\(\)]/g, '');
  const isValidSecondaryPhone = !formData.secondaryPhone || phoneRegex.test(cleanedSecondary);

  // Primary & Secondary Phone Uniqueness Check
  const isSamePhone = formData.phone && formData.secondaryPhone && formData.phone.trim() === formData.secondaryPhone.trim();

  // Password Security Meter Evaluation (Min 3 out of 4 required)
  const pass = formData.password;
  const passChecks = {
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
  };
  const passScore = Object.values(passChecks).filter(Boolean).length;

  const handleChange = (e) => {
    setError(''); // Auto-clear error when user types to correct input
    setEmailValidated(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep1 = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidName) {
      setError('Please enter a valid Full Name (letters and spaces only, min 2 characters).');
      return;
    }
    if (!isValidEmail) {
      setError('Please enter a valid Email Address format (e.g. sarah@example.com).');
      return;
    }

    setCheckingEmail(true);
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      });
      const data = await res.json();
      setCheckingEmail(false);

      if (data.exists) {
        setError('User with this email already exists.');
        return;
      }

      setEmailValidated(true);
      setStep(2);
    } catch (err) {
      setCheckingEmail(false);
      setEmailValidated(true);
      setStep(2);
    }
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    setError('');
    if (passScore < 3) {
      setError('Password must satisfy at least 3 security requirements (Min 8 chars, 1 uppercase, 1 digit, or 1 special symbol).');
      return;
    }
    if (isSamePhone) {
      setError('Primary Mobile Phone and Secondary Phone cannot be the same number.');
      return;
    }
    if (!isValidPrimaryPhone) {
      setError('Please enter a valid Primary Phone number.');
      return;
    }
    if (!isValidSecondaryPhone) {
      setError('Secondary phone format is invalid.');
      return;
    }
    setStep(3);
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      secondaryPhone: formData.secondaryPhone.trim(),
      address: {
        street: formData.street || '45 Galle Road',
        city: formData.city || 'Colombo 03',
        state: formData.state || 'Western Province',
        zipCode: formData.zipCode || '00300',
        country: formData.country || 'Sri Lanka'
      }
    };

    const res = await register(payload);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Registration failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white text-slate-900 animate-fade-in relative">
      
      {/* Back to Store Top Button */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 px-3.5 sm:px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Creative Editorial Fashion Cover & VIP Member Perks */}
        <div className="relative min-h-screen p-12 bg-slate-900 text-white flex flex-col justify-between hidden md:flex overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200" 
            alt="ShopLarvo Haute Couture Registration" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <div className="relative z-10 space-y-3 pt-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-300 text-xs font-bold uppercase tracking-widest border border-white/20">
              <Crown className="w-4 h-4 text-amber-400" /> VIP CLIENT PRIVILEGES 2026
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              JOIN THE HAUTE <br/><span className="text-sky-400">FASHION CLUB</span>
            </h1>
          </div>

          <div className="relative z-10 space-y-4 pb-6">
            <p className="text-xs lg:text-sm text-slate-200 font-light leading-relaxed max-w-md">
              Create your ShopLarvo Account to unlock personalized recommendations, priority access to drop collections, and instant checkout discounts.
            </p>

            <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <Gift className="w-4 h-4 text-sky-400 shrink-0" />
                <span>✦ <strong>25% OFF FIRST ORDER</strong> with Code: <strong className="text-sky-300 font-mono">STYLE25</strong></span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>✦ <strong>AI OUTFIT STYLIST</strong> personal fashion advisor</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>✦ <strong>FREE EXPRESS WORLDWIDE SHIPPING</strong> on orders over $100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: 100% Full-Screen Interactive Stepper Form */}
        <div className="min-h-screen p-6 sm:p-12 md:p-16 flex flex-col justify-center bg-white space-y-6 sm:space-y-8 overflow-y-auto pt-20 md:pt-16">
          
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-widest border border-slate-200 mb-2">
                CUSTOMER REGISTRATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-500 mt-1">Join ShopLarvo with 256-bit encrypted security</p>
            </div>

            {/* Stepper Tabs with Strict Tab Locking */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-[10px] sm:text-[11px] font-bold text-center">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className={`py-2 rounded-xl transition-all ${step === 1 ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                1. Credentials
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (emailValidated && !error) setStep(2);
                }}
                disabled={!emailValidated || !!error}
                className={`py-2 rounded-xl transition-all ${
                  step === 2 
                    ? 'bg-slate-900 text-white shadow' 
                    : (emailValidated && !error ? 'text-slate-500 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed')
                }`}
              >
                2. Security
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (step >= 2 && passScore >= 3 && !isSamePhone) setStep(3);
                }}
                disabled={step < 2 || passScore < 3 || isSamePhone}
                className={`py-2 rounded-xl transition-all ${
                  step === 3 
                    ? 'bg-slate-900 text-white shadow' 
                    : (step >= 2 && passScore >= 3 && !isSamePhone ? 'text-slate-500 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed')
                }`}
              >
                3. Address
              </button>
            </div>

            {/* STEP 1: PERSONAL CREDENTIALS */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" required name="name"
                      value={formData.name} onChange={handleChange}
                      placeholder="e.g. Sarah Connor"
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        formData.name ? (isValidName ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formData.name && (
                    <p className={`text-[10px] mt-1 font-bold ${isValidName ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isValidName ? '✓ Valid Name Format' : '✗ Letters and spaces only (min 2 chars)'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="email" required name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="e.g. sarah@example.com"
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        formData.email ? (isValidEmail && !error ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formData.email && !error && (
                    <p className={`text-[10px] mt-1 font-bold ${isValidEmail ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isValidEmail ? '✓ Valid Email Address' : '✗ Enter format: name@example.com'}
                    </p>
                  )}

                  {/* ERROR ALERT DISPLAYED DIRECTLY INSIDE STEP 1 UNDER EMAIL INPUT */}
                  {error && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={checkingEmail}
                  className="w-full py-4 px-4 font-extrabold text-xs uppercase tracking-widest text-white rounded-2xl gradient-button flex items-center justify-center gap-2 shadow-xl pt-3 mt-4"
                >
                  {checkingEmail ? 'Validating Email...' : <>NEXT: SECURITY & PHONES <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* STEP 2: SECURITY & PHONES */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="space-y-4 animate-fade-in">
                
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" required name="phone"
                      value={formData.phone} onChange={handleChange}
                      placeholder="e.g. +94 77 123 4567"
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        formData.phone ? (!isSamePhone && isValidPrimaryPhone ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formData.phone && (
                    <p className={`text-[10px] mt-1 font-bold ${!isSamePhone && isValidPrimaryPhone ? 'text-emerald-600' : 'text-red-500'}`}>
                      {!isSamePhone && isValidPrimaryPhone ? '✓ Valid Primary Phone' : '✗ Use format: +94 77 123 4567'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Secondary Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" name="secondaryPhone"
                      value={formData.secondaryPhone} onChange={handleChange}
                      placeholder="e.g. +94 11 234 5678"
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        formData.secondaryPhone ? (!isSamePhone && isValidSecondaryPhone ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {formData.secondaryPhone && (
                    <p className={`text-[10px] mt-1 font-bold ${!isSamePhone && isValidSecondaryPhone ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isSamePhone ? '✗ Cannot be identical to Primary Phone' : isValidSecondaryPhone ? '✓ Valid Secondary Phone' : '✗ Invalid phone format'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Secure Password</label>
                  <div className="relative">
                    <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="password" required name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="e.g. SarahStyle#2026"
                      className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-11 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                        pass ? (passScore >= 3 ? 'border-emerald-500' : 'border-amber-400') : 'border-slate-200'
                      }`}
                    />
                  </div>

                  {pass && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center font-bold">
                        <span>Security Meter:</span>
                        <span className={passScore >= 3 ? 'text-emerald-600 font-extrabold' : 'text-amber-600'}>
                          {passScore >= 3 ? 'SECURE (PASS)' : `${passScore}/4 Met (Min 3 Required)`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-600">
                        <span className={passChecks.length ? 'text-emerald-600 font-bold' : ''}>✓ 8+ Chars</span>
                        <span className={passChecks.uppercase ? 'text-emerald-600 font-bold' : ''}>✓ 1 Uppercase</span>
                        <span className={passChecks.number ? 'text-emerald-600 font-bold' : ''}>✓ 1 Digit</span>
                        <span className={passChecks.special ? 'text-emerald-600 font-bold' : ''}>✓ 1 Special</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold">
                    Back
                  </button>
                  <button type="submit" className="flex-1 py-3.5 rounded-2xl gradient-button text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    NEXT: SHIPPING ADDRESS <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SHIPPING ADDRESS */}
            {step === 3 && (
              <form onSubmit={handleSubmitFinal} className="space-y-4 animate-fade-in">
                
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address</label>
                  <input 
                    type="text" required name="street"
                    value={formData.street} onChange={handleChange}
                    placeholder="e.g. 45 Galle Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
                    <input 
                      type="text" required name="city"
                      value={formData.city} onChange={handleChange}
                      placeholder="e.g. Colombo 03"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
                    <input 
                      type="text" required name="country"
                      value={formData.country} onChange={handleChange}
                      placeholder="e.g. Sri Lanka"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-5 py-3.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold">
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-4 px-4 font-extrabold text-xs uppercase tracking-widest text-white rounded-2xl gradient-button shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : <>COMPLETE REGISTRATION NOW <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-slate-500 pt-2">
              Already registered?{' '}
              <Link to="/login" className="text-slate-900 font-extrabold hover:underline">
                Sign In to your Account
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
