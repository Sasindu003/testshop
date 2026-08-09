import React, { useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Truck, Package, Ban } from 'lucide-react';
import { getOrderById } from '../api/orders';
import { useFetch } from '../hooks/useFetch';
import Spinner from '../components/ui/Spinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// All possible statuses in progression order
const STATUS_STEPS = ['pending', 'verified', 'shipped', 'delivered'];

const STATUS_META = {
  pending:   { icon: Clock,        label: 'Order Placed',     color: 'text-yellow-600' },
  verified:  { icon: CheckCircle,  label: 'Payment Verified', color: 'text-blue-600' },
  shipped:   { icon: Truck,        label: 'Shipped',          color: 'text-indigo-600' },
  delivered: { icon: Package,      label: 'Delivered',        color: 'text-green-600' },
  rejected:  { icon: XCircle,      label: 'Rejected',         color: 'text-red-600' },
  cancelled: { icon: Ban,          label: 'Cancelled',        color: 'text-gray-500' },
};

const STATUS_BADGE = {
  pending:   'bg-yellow-50  text-yellow-700  border-yellow-200',
  verified:  'bg-blue-50    text-blue-700    border-blue-200',
  shipped:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  delivered: 'bg-green-50   text-green-700   border-green-200',
  rejected:  'bg-red-50     text-red-700     border-red-200',
  cancelled: 'bg-gray-50    text-gray-600    border-gray-200',
};

function StatusTimeline({ statusHistory = [], currentStatus }) {
  // Determine which path to show: normal progression or terminal (rejected/cancelled)
  const isTerminal = ['rejected', 'cancelled'].includes(currentStatus);

  // Build a display list:
  // - Always show every entry from statusHistory (these are actual DB records)
  // - If not terminal, append any future STATUS_STEPS not yet reached as upcoming
  const historySet = new Set(statusHistory.map((h) => h.status));

  // Steps to render
  const displaySteps = isTerminal
    ? statusHistory  // only real history entries for terminal orders
    : [
        ...statusHistory,
        ...STATUS_STEPS.filter(
          (s) => !historySet.has(s) && STATUS_STEPS.indexOf(s) > STATUS_STEPS.indexOf(currentStatus)
        ).map((s) => ({ status: s, changedAt: null })), // upcoming
      ];

  return (
    <div className="space-y-0 font-sans">
      {displaySteps.map((entry, i) => {
        const isLast = i === displaySteps.length - 1;
        const isCurrent = entry.status === currentStatus && entry.changedAt;
        const isPast = entry.changedAt != null;
        const meta = STATUS_META[entry.status] || STATUS_META.pending;
        const Icon = meta.icon;

        return (
          <div key={`${entry.status}-${i}`} className="flex gap-3">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isPast ? 'border-primary bg-primary' : 'border-border bg-background'
                }`}
              >
                <Icon size={14} className={isPast ? 'text-surface' : 'text-secondary'} />
              </div>
              {!isLast && (
                <div className={`w-px flex-1 my-1 min-h-[20px] ${isPast ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-medium ${isPast ? 'text-primary' : 'text-secondary'}`}>
                {meta.label}
              </p>
              {entry.changedAt ? (
                <p className="text-xs text-secondary mt-0.5">
                  {new Date(entry.changedAt).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-xs text-secondary mt-0.5 italic">Upcoming</p>
              )}
              {entry.note && (
                <p className="text-xs text-error mt-1 font-medium">Note: {entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const { data, loading, error } = useFetch(
    useCallback(() => getOrderById(id), [id])
  );

  const order = data?.order || data;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-sans">
        <p className="text-error mb-4">{error || 'Order not found.'}</p>
        <Link to="/orders" className="text-primary underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const {
    _id, status, items = [], shippingAddress, subtotal, discountTotal, total,
    couponCode, paymentSlipUrl, statusHistory = [], createdAt,
  } = order;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 font-sans">
      {/* Success banner */}
      {justPlaced && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded flex items-center gap-3 text-green-700 text-sm">
          <CheckCircle size={18} className="shrink-0" />
          Your order was placed successfully! We'll notify you when it's verified.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <Link to="/orders" className="text-xs text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
            ← All orders
          </Link>
          <h1 className="text-2xl font-serif text-primary mt-1">
            Order #{_id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-secondary mt-1">
            Placed {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`self-start sm:self-auto text-xs px-3 py-1 rounded border font-semibold capitalize ${STATUS_BADGE[status] || ''}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: items + address */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order items */}
          <section>
            <h2 className="text-base font-semibold text-primary uppercase tracking-wider mb-4">Items</h2>
            <div className="border border-border rounded divide-y divide-border">
              {items.map((item, i) => {
                const img = item.product?.imageFileIds?.length
                  ? `${API}/products/${item.product._id}/images/${item.product.imageFileIds[0]}`
                  : null;
                return (
                  <div key={i} className="flex gap-4 p-4">
                    <div className="w-14 h-16 rounded overflow-hidden bg-background border border-border shrink-0">
                      {img ? (
                        <img src={img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-secondary">—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary line-clamp-1">{item.name}</p>
                      <p className="text-xs text-secondary mt-0.5">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary shrink-0">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Shipping address */}
          {shippingAddress && (
            <section>
              <h2 className="text-base font-semibold text-primary uppercase tracking-wider mb-4">Shipping Address</h2>
              <div className="border border-border rounded p-4 text-sm text-secondary space-y-0.5">
                <p className="text-primary font-medium">{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
              </div>
            </section>
          )}

          {/* Payment slip */}
          {paymentSlipUrl && (
            <section>
              <h2 className="text-base font-semibold text-primary uppercase tracking-wider mb-4">Payment Slip</h2>
              <a
                href={paymentSlipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
              >
                View uploaded slip ↗
              </a>
            </section>
          )}
        </div>

        {/* Right: summary + timeline */}
        <div className="space-y-8">
          {/* Order summary */}
          <section className="border border-border rounded p-5 space-y-3">
            <h2 className="text-base font-semibold text-primary uppercase tracking-wider">Summary</h2>
            <div className="flex justify-between text-sm text-secondary">
              <span>Subtotal</span>
              <span className="text-primary">${subtotal?.toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount {couponCode && `(${couponCode})`}</span>
                <span>−${discountTotal?.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-semibold text-primary">
              <span>Total</span>
              <span>${total?.toFixed(2)}</span>
            </div>
          </section>

          {/* Status timeline — directly from statusHistory */}
          <section>
            <h2 className="text-base font-semibold text-primary uppercase tracking-wider mb-4">Order Status</h2>
            <StatusTimeline statusHistory={statusHistory} currentStatus={status} />
          </section>
        </div>
      </div>
    </div>
  );
}
