import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, ShieldCheck, Truck, RefreshCw, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 w-full mt-auto">
      <div className="w-full max-w-none px-6 lg:px-12 space-y-12">
        
        {/* Value Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <Truck className="w-6 h-6 text-sky-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white">Express Delivery</h4>
              <p className="text-slate-400 text-[11px]">Free shipping on orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <RefreshCw className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white">30-Day Easy Returns</h4>
              <p className="text-slate-400 text-[11px]">Hassle-free size exchange policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white">Encrypted Checkout</h4>
              <p className="text-slate-400 text-[11px]">256-bit SSL secured payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <PhoneCall className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-white">24/7 Client Advisory</h4>
              <p className="text-slate-400 text-[11px]">Dedicated fashion stylist team</p>
            </div>
          </div>
        </div>

        {/* Brand & Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-xs">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-extrabold">
                <Gem className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">SHOP<span className="text-slate-400">LARVO</span></span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-1">EXECUTIVE FASHION EDITION</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              ShopLarvo is Sri Lanka’s premier smart apparel destination, curating bespoke luxury suits, streetwear, and haute couture clothing.
            </p>
            <div className="space-y-1 text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> 45 Galle Road, Colombo 03, Sri Lanka</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" /> support@shoplarvo.com</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Shop Collections</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Women Fashion</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Men Fashion</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Streetwear & Hoodies</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Suits & Tailoring</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Outlet Sale %</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About ShopLarvo</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Client Support</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Size Guide & Fit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Executive Club</h4>
            <p className="text-slate-400 mb-3">Subscribe for 25% off your first order.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input 
                type="email" 
                placeholder="Enter client email..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button type="submit" className="w-full py-2 bg-white text-slate-950 font-extrabold rounded-xl hover:bg-sky-400 transition-colors">
                JOIN EXECUTIVE CLUB
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <p>© 2026 ShopLarvo Inc. All rights reserved. Powered by Supabase & MERN Stack.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Center</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
