import React from 'react';
import { Cpu, Sparkles, CheckCircle, Zap } from 'lucide-react';

export default function AIRecommendationWidget() {
  return (
    <div className="glass-card rounded-3xl p-8 border border-blue-200 bg-gradient-to-br from-blue-50 via-slate-50 to-white text-slate-900 space-y-4 shadow-md">
      
      <div className="flex justify-between items-center border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Fashion Stylist & Recommendation Engine</h3>
            <p className="text-xs text-slate-500">Automated machine learning outfit pairing & trend analysis</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
          LIVE AI ENGINE ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Style Match Score</span>
            <span className="text-blue-600 font-extrabold">98.4%</span>
          </div>
          <p className="text-[11px] text-slate-500">High affinity pairing for Oversized Hoodies & Cargo Denim</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Dynamic Discount Target</span>
            <span className="text-emerald-600 font-extrabold">+22% Conv.</span>
          </div>
          <p className="text-[11px] text-slate-500">Promo code STYLE25 optimized for first-time shoppers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Trend Prediction</span>
            <span className="text-purple-600 font-extrabold">Italian Wool</span>
          </div>
          <p className="text-[11px] text-slate-500">High demand surge predicted for Formal Tailored Suits</p>
        </div>
      </div>

    </div>
  );
}
