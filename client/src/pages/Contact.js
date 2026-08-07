import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 animate-fade-in py-4 w-full text-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left info */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white space-y-6 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Client Services & Help</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Have questions about your clothing orders, shipping, returns, or AI stylist recommendations? Our client services team is ready to assist.
          </p>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900"><MapPin className="w-5 h-5" /></div>
              <div><strong className="block text-slate-900">Headquarters</strong> 45 Galle Road, Colombo 03, Sri Lanka</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900"><Phone className="w-5 h-5" /></div>
              <div><strong className="block text-slate-900">Phone Support</strong> +94 11 234 5678</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900"><Mail className="w-5 h-5" /></div>
              <div><strong className="block text-slate-900">Email Support</strong> support@stylehub.com</div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Send us a Message</h2>
          
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold space-y-1">
              <Check className="w-5 h-5 text-emerald-600" />
              <p>Thank you! Your message has been sent to StyleHub Client Services.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                <input type="text" required placeholder="Sarah Connor" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Email</label>
                <input type="email" required placeholder="sarah@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message</label>
                <textarea rows="4" required placeholder="How can we help you?" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl gradient-button text-xs font-bold text-white uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
