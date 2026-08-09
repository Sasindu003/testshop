import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Eye, CheckCircle, XCircle, Truck, Package, X, Clock, Ban } from 'lucide-react';
import { getAdminOrders, getAdminOrderById, verifyOrder, rejectOrder, updateOrderStatus } from '../../api/admin';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
  pending:   'bg-yellow-50  text-yellow-700  border-yellow-200',
  verified:  'bg-blue-50    text-blue-700    border-blue-200',
  shipped:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  delivered: 'bg-green-50   text-green-700   border-green-200',
  rejected:  'bg-red-50     text-red-700     border-red-200',
  cancelled: 'bg-gray-50    text-gray-600    border-gray-200',
};

const ALL_STATUSES = ['pending', 'verified', 'shipped', 'delivered', 'rejected', 'cancelled'];

const VALID_TRANSITIONS = {
  pending:  ['verified', 'rejected'],
  verified: ['shipped'],
  shipped:  ['delivered'],
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetcher = useCallback((params) => getAdminOrders(params), []);
  const { data: orders, meta, loading, fetch } = usePagination(fetcher, {}, 10);

  useEffect(() => {
    fetch(1, statusFilter ? { status: statusFilter } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openDrawer = async (orderId) => {
    setDrawerLoading(true);
    setShowRejectForm(false);
    setRejectReason('');
    try {
      const { data } = await getAdminOrderById(orderId);
      setDrawerOrder(data.data || data.order || data);
    } catch {
      toast('Failed to load order details.', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOrder(null);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleVerify = async () => {
    if (!drawerOrder) return;
    setActionLoading(true);
    try {
      await verifyOrder(drawerOrder._id);
      toast('Order verified.', 'success');
      // Refresh drawer + list
      await openDrawer(drawerOrder._id);
      fetch(meta.currentPage, statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to verify.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!drawerOrder || !rejectReason.trim()) {
      toast('A rejection reason is required.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await rejectOrder(drawerOrder._id, rejectReason.trim());
      toast('Order rejected.', 'success');
      await openDrawer(drawerOrder._id);
      fetch(meta.currentPage, statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgress = async () => {
    if (!drawerOrder) return;
    const next = VALID_TRANSITIONS[drawerOrder.status]?.[0];
    if (!next || next === 'rejected') return;
    setActionLoading(true);
    try {
      await updateOrderStatus(drawerOrder._id, next);
      toast(`Order marked as ${next}.`, 'success');
      await openDrawer(drawerOrder._id);
      fetch(meta.currentPage, statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const StatusIcon = ({ status }) => {
    const map = { pending: Clock, verified: CheckCircle, shipped: Truck, delivered: Package, rejected: XCircle, cancelled: Ban };
    const Icon = map[status] || Clock;
    return <Icon size={14} />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-primary">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap font-sans">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 text-xs rounded border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${!statusFilter ? 'bg-primary text-surface border-primary' : 'bg-surface text-secondary border-border hover:border-primary hover:text-primary'}`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded border capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${statusFilter === s ? 'bg-primary text-surface border-primary' : 'bg-surface text-secondary border-border hover:border-primary hover:text-primary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-20 font-sans bg-surface border border-border rounded-lg">
          <ShoppingCart size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">{statusFilter ? `No ${statusFilter} orders.` : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders?.map((order) => (
                <tr key={order._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-primary text-sm">{order.customer?.name || '—'}</p>
                    <p className="text-xs text-secondary">{order.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">${order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border capitalize font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                      <StatusIcon status={order.status} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary text-xs">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDrawer(order._id)}
                      className="p-1.5 text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded border border-transparent hover:border-border hover:bg-background"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta?.totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-center">
              <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={(p) => fetch(p, statusFilter ? { status: statusFilter } : {})} />
            </div>
          )}
        </div>
      )}

      {/* ── Detail Drawer ────────────────────────────────────────────── */}
      {(drawerOrder || drawerLoading) && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm" onClick={closeDrawer} />
          <aside className="relative w-full max-w-lg bg-surface h-full shadow-xl flex flex-col overflow-y-auto font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-surface z-10 flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-serif text-primary">
                {drawerOrder ? `Order #${drawerOrder._id.slice(-8).toUpperCase()}` : 'Loading…'}
              </h2>
              <button onClick={closeDrawer} className="text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
                <X size={20} />
              </button>
            </div>

            {drawerLoading ? (
              <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
            ) : drawerOrder && (
              <div className="p-5 space-y-6 flex-1">
                {/* Status + customer */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border capitalize font-semibold ${STATUS_STYLES[drawerOrder.status] || ''}`}>
                    <StatusIcon status={drawerOrder.status} />
                    {drawerOrder.status}
                  </span>
                  <span className="text-xs text-secondary">
                    {new Date(drawerOrder.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {drawerOrder.customer && (
                  <div className="text-sm">
                    <p className="font-medium text-primary">{drawerOrder.customer.name}</p>
                    <p className="text-secondary">{drawerOrder.customer.email}</p>
                  </div>
                )}

                {/* Items */}
                <section>
                  <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Items ({drawerOrder.items?.length})</h3>
                  <div className="border border-border rounded divide-y divide-border text-sm">
                    {drawerOrder.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3">
                        <div>
                          <p className="text-primary font-medium">{item.name}</p>
                          <p className="text-xs text-secondary">Size: {item.size} · Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-primary">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Summary */}
                <section className="border border-border rounded p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-secondary"><span>Subtotal</span><span className="text-primary">${drawerOrder.subtotal?.toFixed(2)}</span></div>
                  {drawerOrder.discountTotal > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount {drawerOrder.couponCode && `(${drawerOrder.couponCode})`}</span><span>−${drawerOrder.discountTotal?.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-semibold text-primary border-t border-border pt-2"><span>Total</span><span>${drawerOrder.total?.toFixed(2)}</span></div>
                </section>

                {/* Shipping */}
                {drawerOrder.shippingAddress && (
                  <section>
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Shipping Address</h3>
                    <div className="text-sm text-secondary border border-border rounded p-3 space-y-0.5">
                      <p className="text-primary font-medium">{drawerOrder.shippingAddress.line1}</p>
                      {drawerOrder.shippingAddress.line2 && <p>{drawerOrder.shippingAddress.line2}</p>}
                      <p>{drawerOrder.shippingAddress.city}, {drawerOrder.shippingAddress.postalCode}</p>
                    </div>
                  </section>
                )}

                {/* Payment Slip — inline image */}
                {drawerOrder.paymentSlipFileId && (
                  <section>
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Payment Slip</h3>
                    <div className="border border-border rounded overflow-hidden bg-background">
                      <img
                        src={drawerOrder.paymentSlipUrl || `${API}/files/${drawerOrder.paymentSlipFileId}`}
                        alt="Payment slip"
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                    <a
                      href={drawerOrder.paymentSlipUrl || `${API}/files/${drawerOrder.paymentSlipFileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-primary underline hover:text-accent"
                    >
                      Open in new tab ↗
                    </a>
                  </section>
                )}

                {/* Status History */}
                {drawerOrder.statusHistory?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Status History</h3>
                    <div className="space-y-2">
                      {drawerOrder.statusHistory.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <StatusIcon status={h.status} />
                          <div>
                            <span className="capitalize font-medium text-primary">{h.status}</span>
                            <span className="text-xs text-secondary ml-2">
                              {new Date(h.changedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {h.note && <p className="text-xs text-error mt-0.5">Reason: {h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Actions ────────────────────────────────────────── */}
                <section className="border-t border-border pt-4 space-y-3">
                  {/* Pending → Verify / Reject */}
                  {drawerOrder.status === 'pending' && (
                    <>
                      <div className="flex gap-3">
                        <Button onClick={handleVerify} loading={actionLoading} className="flex-1">
                          <CheckCircle size={15} /> Verify Payment
                        </Button>
                        <Button variant="secondary" onClick={() => setShowRejectForm(true)} className="flex-1" disabled={showRejectForm}>
                          <XCircle size={15} /> Reject
                        </Button>
                      </div>
                      {showRejectForm && (
                        <div className="space-y-2 p-3 bg-error/5 border border-error/20 rounded">
                          <textarea
                            className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-primary focus:outline-none focus:border-accent"
                            rows={2}
                            placeholder="Rejection reason (required)…"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={() => { setShowRejectForm(false); setRejectReason(''); }}>Cancel</Button>
                            <Button size="sm" onClick={handleReject} loading={actionLoading} disabled={!rejectReason.trim()} className="bg-error hover:bg-error/80">Confirm Reject</Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Verified → Shipped */}
                  {drawerOrder.status === 'verified' && (
                    <Button onClick={handleProgress} loading={actionLoading} fullWidth>
                      <Truck size={15} /> Mark as Shipped
                    </Button>
                  )}

                  {/* Shipped → Delivered */}
                  {drawerOrder.status === 'shipped' && (
                    <Button onClick={handleProgress} loading={actionLoading} fullWidth>
                      <Package size={15} /> Mark as Delivered
                    </Button>
                  )}

                  {/* Terminal */}
                  {['delivered', 'rejected', 'cancelled'].includes(drawerOrder.status) && (
                    <p className="text-xs text-center text-secondary">This order has reached a final state.</p>
                  )}
                </section>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
