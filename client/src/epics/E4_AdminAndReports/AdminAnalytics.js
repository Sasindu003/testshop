import React from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Loader2, PieChart, Clock, RefreshCw, Truck, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminAnalytics({ stats }) {
  if (!stats) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Real-time Analytics...</span>
      </div>
    );
  }

  const {
    totalSales = 0,
    totalOrders = 0,
    totalCustomers = 0,
    lowStockProducts = 0,
    ordersByStatus = {}
  } = stats;

  const isEmpty = totalOrders === 0 && lowStockProducts === 0 && totalCustomers === 0;

  const statusConfig = [
    { label: 'Pending Payment', key: 'Pending Payment', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Processing', key: 'Processing', icon: RefreshCw, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Shipped', key: 'Shipped', icon: Truck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Delivered', key: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Cancelled', key: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' }
  ];

  return (
    <div className="space-y-6">
      
      {isEmpty && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2">
          <PieChart className="w-4 h-4 shrink-0" />
          <span>No order activity or catalog metrics recorded yet in MongoDB. Displaying initial zero state.</span>
        </div>
      )}

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Excludes cancelled orders
          </span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalOrders}</div>
          <span className="text-[11px] font-bold text-slate-400">Recorded across database</span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Customers</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalCustomers}</div>
          <span className="text-[11px] font-bold text-slate-400">Registered customer accounts</span>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Low Stock Items</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold ${lowStockProducts > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockProducts}
          </div>
          <span className="text-[11px] font-bold text-slate-400">At or below reorder threshold</span>
        </div>

      </div>

      {/* Orders Grouped by Status */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-slate-900" /> Order Fulfillment Status Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {statusConfig.map((item) => {
            const count = ordersByStatus[item.key] || 0;
            const Icon = item.icon;
            return (
              <div key={item.key} className={`p-4 rounded-2xl border ${item.color} flex flex-col justify-between space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.label}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold">{count}</div>
                <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-current h-full transition-all duration-500"
                    style={{ width: `${totalOrders > 0 ? Math.min(100, (count / totalOrders) * 100) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
