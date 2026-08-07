import React from 'react';
import { Sparkles, Shield, Cpu, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-12 animate-fade-in py-4 w-full text-slate-900">
      
      {/* Hero */}
      <div className="glass-card rounded-3xl p-12 border border-slate-200 bg-white text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest border border-slate-200">
          <Sparkles className="w-3.5 h-3.5" /> About StyleHub
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Smart Clothing Shop Management & Fashion E-Commerce</h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          StyleHub combines luxury e-commerce fashion with an enterprise-grade Smart Clothing Shop Management System built on the MERN stack and hosted on MongoDB Atlas.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <Shield className="w-8 h-8 text-slate-900" />
          <h3 className="text-base font-bold text-slate-900">JWT Token Security</h3>
          <p className="text-xs text-slate-500">Encrypted user authentication, password hashing, and role-based access control for Admins, Staff, and Customers.</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <Cpu className="w-8 h-8 text-slate-900" />
          <h3 className="text-base font-bold text-slate-900">AI Fashion Stylist</h3>
          <p className="text-xs text-slate-500">Automated machine learning recommendation engine for outfit pairing and dynamic promo discount targeting.</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <Award className="w-8 h-8 text-slate-900" />
          <h3 className="text-base font-bold text-slate-900">Live MongoDB Atlas Database</h3>
          <p className="text-xs text-slate-500">Real-time cloud database persistence for inventory stock, order tracking timeline, employee records, and promo coupons.</p>
        </div>
      </div>

    </div>
  );
}
