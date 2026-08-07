import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AddressManager from './AddressManager';
import { User, Mail, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function UserProfile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Please sign in to view your customer profile.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in py-4 w-full text-slate-900">
      
      {/* Customer Header Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200 bg-white flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
              {user.role} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
          </p>
          <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone || '+94 77 123 4567'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddressManager />
        
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="w-5 h-5 text-slate-900" /> Account Security & Preferences
          </h3>
          <div className="space-y-3 text-slate-600">
            <p><strong className="text-slate-900">Authentication Mode:</strong> Encrypted JWT Bearer Tokens</p>
            <p><strong className="text-slate-900">Database Record:</strong> Synchronized with MongoDB Atlas</p>
            <p><strong className="text-slate-900">Security Status:</strong> Account Password Hashed (bcryptjs)</p>
          </div>
        </div>
      </div>

    </div>
  );
}
