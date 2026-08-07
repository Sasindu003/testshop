import React from 'react';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function OrderTracking({ order }) {
  if (!order) return null;

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = statuses.indexOf(order.status) !== -1 ? statuses.indexOf(order.status) : 1;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID: #{order._id}</span>
          <h4 className="text-sm font-bold text-slate-900">Tracking Number: <span className="text-blue-600 font-mono">{order.trackingNumber || 'SH-TRK-98742'}</span></h4>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          Status: {order.status}
        </span>
      </div>

      {/* Progress Line */}
      <div className="flex justify-between items-center relative pt-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-slate-900 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
        ></div>

        {statuses.map((st, idx) => {
          const isDone = idx <= currentIndex;
          return (
            <div key={st} className="flex flex-col items-center z-10 space-y-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                isDone ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : (idx + 1)}
              </div>
              <span className={`text-[10px] font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                {st}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
