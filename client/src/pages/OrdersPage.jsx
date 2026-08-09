import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { getMyOrders } from '../api/orders';
import { usePagination } from '../hooks/usePagination';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';

const STATUS_STYLES = {
  pending:   'bg-yellow-50  text-yellow-700  border-yellow-200',
  verified:  'bg-blue-50    text-blue-700    border-blue-200',
  shipped:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  delivered: 'bg-green-50   text-green-700   border-green-200',
  rejected:  'bg-red-50     text-red-700     border-red-200',
  cancelled: 'bg-gray-50    text-gray-600    border-gray-200',
};

const ALL_STATUSES = ['pending', 'verified', 'shipped', 'delivered', 'rejected', 'cancelled'];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const fetcher = useCallback(
    (params) => getMyOrders(params),
    []
  );

  const { data: orders, meta, loading, error, fetch } = usePagination(fetcher, {}, 10);

  // Run fetch on mount and on filter change
  const [initialized, setInitialized] = useState(false);
  React.useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : {};
    fetch(1, params);
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-3xl font-serif text-primary mb-6">My Orders</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6 font-sans">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 text-xs rounded border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            !statusFilter
              ? 'bg-primary text-surface border-primary'
              : 'bg-surface text-secondary border-border hover:border-primary hover:text-primary'
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded border capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              statusFilter === s
                ? 'bg-primary text-surface border-primary'
                : 'bg-surface text-secondary border-border hover:border-primary hover:text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-20 text-error font-sans border border-dashed border-error/30 rounded bg-error/5">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 font-sans">
          <Package size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">
            {statusFilter ? `No ${statusFilter} orders found.` : "You haven't placed any orders yet."}
          </p>
          {!statusFilter && (
            <Link to="/products" className="inline-block mt-4 text-sm text-primary underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
              Start shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center gap-4 border border-border rounded p-4 hover:border-primary transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="flex-1 min-w-0 font-sans">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded border capitalize font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  {' · '}
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  {' · '}
                  <span className="font-medium text-primary">${order.total?.toFixed(2)}</span>
                </p>
              </div>
              <ChevronRight size={18} className="text-secondary group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            onPageChange={(p) => fetch(p, statusFilter ? { status: statusFilter } : {})}
          />
        </div>
      )}
    </div>
  );
}
