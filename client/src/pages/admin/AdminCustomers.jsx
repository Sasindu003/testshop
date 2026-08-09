import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Eye, Ban, X, ShoppingCart, ChevronRight } from 'lucide-react';
import { getCustomers, getCustomerById, deactivateCustomer } from '../../api/admin';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/ui/ToastProvider';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';

const STATUS_STYLES = {
  pending:   'bg-yellow-50  text-yellow-700  border-yellow-200',
  verified:  'bg-blue-50    text-blue-700    border-blue-200',
  shipped:   'bg-indigo-50  text-indigo-700  border-indigo-200',
  delivered: 'bg-green-50   text-green-700   border-green-200',
  rejected:  'bg-red-50     text-red-700     border-red-200',
  cancelled: 'bg-gray-50    text-gray-600    border-gray-200',
};

export default function AdminCustomers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  // Detail drawer
  const [drawerCustomer, setDrawerCustomer] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetcher = useCallback((params) => getCustomers(params), []);
  const { data: customers, meta, loading, fetch } = usePagination(fetcher, {}, 10);

  useEffect(() => {
    fetch(1, searchApplied ? { search: searchApplied } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchApplied]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchApplied(searchQuery.trim());
  };

  const openDrawer = async (customerId) => {
    setDrawerLoading(true);
    try {
      const { data } = await getCustomerById(customerId);
      setDrawerCustomer(data.data || data.customer || data);
    } catch {
      toast('Failed to load customer details.', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => setDrawerCustomer(null);

  const handleDeactivate = async () => {
    if (!drawerCustomer) return;
    if (!window.confirm(`Deactivate ${drawerCustomer.name}? They will no longer be able to log in.`)) return;
    try {
      await deactivateCustomer(drawerCustomer._id);
      toast('Customer deactivated.', 'success');
      await openDrawer(drawerCustomer._id);
      fetch(meta.currentPage, searchApplied ? { search: searchApplied } : {});
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to deactivate.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-primary">Customers</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 font-sans max-w-md">
        <Input
          placeholder="Search by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leading={<Search size={16} />}
        />
        <Button type="submit" size="sm">Search</Button>
        {searchApplied && (
          <Button type="button" variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSearchApplied(''); }}>Clear</Button>
        )}
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : customers?.length === 0 ? (
        <div className="text-center py-20 font-sans bg-surface border border-border rounded-lg">
          <Users size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">{searchApplied ? `No customers matching "${searchApplied}".` : 'No customers yet.'}</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers?.map((c) => (
                <tr key={c._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{c.name}</p>
                    <p className="text-xs text-secondary">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-secondary">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-secondary text-xs">
                    {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {c.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDrawer(c._id)}
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
              <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={(p) => fetch(p, searchApplied ? { search: searchApplied } : {})} />
            </div>
          )}
        </div>
      )}

      {/* ── Detail Drawer ────────────────────────────────────────────── */}
      {(drawerCustomer || drawerLoading) && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm" onClick={closeDrawer} />
          <aside className="relative w-full max-w-lg bg-surface h-full shadow-xl flex flex-col overflow-y-auto font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-surface z-10 flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-serif text-primary">{drawerCustomer?.name || 'Loading…'}</h2>
              <button onClick={closeDrawer} className="text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
                <X size={20} />
              </button>
            </div>

            {drawerLoading ? (
              <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
            ) : drawerCustomer && (
              <div className="p-5 space-y-6 flex-1">
                {/* Profile info */}
                <section className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Email</span>
                    <span className="text-primary font-medium">{drawerCustomer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Phone</span>
                    <span className="text-primary">{drawerCustomer.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Joined</span>
                    <span className="text-primary">{new Date(drawerCustomer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${drawerCustomer.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {drawerCustomer.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                </section>

                {/* Addresses */}
                {drawerCustomer.addresses?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                      Addresses ({drawerCustomer.addresses.length})
                    </h3>
                    <div className="space-y-2">
                      {drawerCustomer.addresses.map((addr, i) => (
                        <div key={i} className="text-sm border border-border rounded p-3 space-y-0.5">
                          {addr.label && <p className="text-[10px] text-accent font-bold uppercase tracking-wider">{addr.label}{addr.isDefault ? ' · Default' : ''}</p>}
                          <p className="text-primary">{addr.line1}</p>
                          {addr.line2 && <p className="text-secondary">{addr.line2}</p>}
                          <p className="text-secondary">{addr.city}, {addr.postalCode}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Order history */}
                <section>
                  <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                    Order History ({drawerCustomer.orders?.length || 0})
                  </h3>
                  {!drawerCustomer.orders || drawerCustomer.orders.length === 0 ? (
                    <p className="text-sm text-secondary py-4 text-center">No orders.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {drawerCustomer.orders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between border border-border rounded p-3 text-sm hover:border-primary transition-colors">
                          <div>
                            <p className="font-medium text-primary">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-secondary mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {' · '}
                              ${order.total?.toFixed(2)}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border capitalize font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Deactivate */}
                {drawerCustomer.isActive && (
                  <section className="border-t border-border pt-4">
                    <Button variant="secondary" fullWidth onClick={handleDeactivate} className="text-error border-error/30 hover:bg-error/10">
                      <Ban size={15} /> Deactivate Customer
                    </Button>
                  </section>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
