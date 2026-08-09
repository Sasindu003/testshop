import React, { useEffect, useState, useCallback } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import { getDashboardSummary, getTopProducts, getRevenueTrend, getInventoryHealth } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

const COLORS = ['#1A1A1A', '#4A4A4A', '#8B5A2B', '#C9A982', '#A3A3A3', '#E5E5E5'];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, productsRes, trendRes, invRes] = await Promise.all([
        getDashboardSummary(),
        getTopProducts(),
        getRevenueTrend({ interval: 'day' }),
        getInventoryHealth()
      ]);

      setSummary(summaryRes.data.data);
      setTopProducts(productsRes.data.data);
      
      // Format trend dates nicely
      const trendData = (trendRes.data.data || []).map(item => ({
        ...item,
        dateFormatted: new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
      setRevenueTrend(trendData);
      
      setInventoryHealth(invRes.data.data);
    } catch (err) {
      toast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Transform order stats for pie chart
  const orderStatusData = summary?.ordersByStatus 
    ? Object.entries(summary.ordersByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const totalOrders = orderStatusData.reduce((acc, curr) => acc + curr.value, 0);

  const StatCard = ({ title, value, icon: Icon, subtitle, highlightClass = 'text-primary' }) => (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-sans font-semibold text-secondary uppercase tracking-wider">{title}</h3>
        <div className={`p-2 bg-background border border-border rounded ${highlightClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-serif text-primary">{value}</p>
        {subtitle && <p className="text-xs text-secondary mt-1 font-sans">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
      </div>

      {/* ── Summary Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${(summary?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toLocaleString()} 
          icon={ShoppingBag}
        />
        <StatCard 
          title="Total Customers" 
          value={(summary?.customerCount || 0).toLocaleString()} 
          icon={Users}
        />
        <StatCard 
          title="Inventory Alerts" 
          value={(inventoryHealth?.outOfStock || 0) + (inventoryHealth?.lowStock || 0)}
          subtitle={`${inventoryHealth?.outOfStock || 0} out of stock, ${inventoryHealth?.lowStock || 0} low stock`}
          icon={AlertCircle}
          highlightClass={((inventoryHealth?.outOfStock || 0) > 0) ? 'text-error bg-error/10 border-error/20' : 'text-primary'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* ── Revenue Trend Chart ────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5 shadow-sm">
          <h3 className="text-base font-semibold text-primary mb-6">Revenue Over Time</h3>
          <div className="h-[300px] w-full">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4A4A4A' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#4A4A4A' }}
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E5E5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '13px' }}
                    itemStyle={{ color: '#1A1A1A', fontWeight: 600 }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelStyle={{ color: '#4A4A4A', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={3} dot={{ r: 4, fill: '#1A1A1A', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8B5A2B', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-secondary">No revenue data available.</div>
            )}
          </div>
        </div>

        {/* ── Order Status Breakdown ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-primary mb-6">Orders by Status</h3>
          <div className="flex-1 min-h-[250px] w-full flex items-center justify-center relative">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-secondary">No order data available.</div>
            )}
          </div>
          {/* Custom Legend */}
          {orderStatusData.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              {orderStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 capitalize text-secondary">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top Products ────────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-lg p-5 shadow-sm">
          <h3 className="text-base font-semibold text-primary mb-6">Top Selling Products</h3>
          <div className="h-[300px] w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 5, right: 0, bottom: 5, left: -20 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4A4A4A' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1A1A1A' }} width={180} />
                  <RechartsTooltip 
                    cursor={{ fill: '#F5F5F5' }}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #E5E5E5', fontSize: '13px' }}
                    formatter={(value) => [value, 'Units Sold']}
                  />
                  <Bar dataKey="unitsSold" fill="#C9A982" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-secondary">No product sales yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
