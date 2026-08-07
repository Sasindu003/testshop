import React from 'react';
import { Printer, Sparkles, Download, Check } from 'lucide-react';

export default function InvoiceView({ order }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-slate-900 printable-area">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-900" />
            <h2 className="text-2xl font-extrabold tracking-tight">STYLEHUB INVOICE</h2>
          </div>
          <p className="text-xs text-slate-500">Smart Clothing Shop Management System</p>
        </div>
        <div className="text-right space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Invoice Number</span>
          <h3 className="text-base font-extrabold font-mono text-slate-900">INV-{order._id.substring(0, 8).toUpperCase()}</h3>
          <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer & Address */}
      <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Billed To:</h4>
          <p className="font-semibold text-slate-800">{order.user?.name || 'Customer'}</p>
          <p className="text-slate-600">{order.shippingAddress?.street}</p>
          <p className="text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
          <p className="text-slate-600">{order.shippingAddress?.country}</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Payment Information:</h4>
          <p className="text-slate-700">Method: <strong className="text-slate-900">{order.paymentMethod || 'Credit Card'}</strong></p>
          <p className="text-slate-700">Status: <strong className="text-emerald-600">PAID & VERIFIED</strong></p>
          <p className="text-slate-700">Tracking: <strong className="font-mono text-blue-600">{order.trackingNumber || 'SH-TRK-98742'}</strong></p>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100 font-bold text-slate-700 uppercase border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">Item Description</th>
            <th className="py-3 px-4">Size & Color</th>
            <th className="py-3 px-4">Qty</th>
            <th className="py-3 px-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.orderItems?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-3 px-4 font-bold text-slate-900">{item.title}</td>
              <td className="py-3 px-4 text-slate-500">{item.selectedSize} / {item.selectedColor}</td>
              <td className="py-3 px-4 font-bold text-slate-900">{item.quantity}</td>
              <td className="py-3 px-4 text-right font-extrabold text-slate-900">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invoice Total */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <button onClick={handlePrint} className="no-print px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow">
          <Printer className="w-4 h-4" /> Print / Save PDF Invoice
        </button>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Grand Total</span>
          <span className="text-2xl font-extrabold text-slate-900">${order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}
