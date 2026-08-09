import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Tags, Users, Sparkles,
  ChevronLeft, ChevronRight, LogOut, Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products',    icon: Package,         label: 'Products' },
  { to: '/admin/orders',      icon: ShoppingCart,     label: 'Orders' },
  { to: '/admin/coupons',     icon: Tags,            label: 'Coupons' },
  { to: '/admin/users',       icon: Users,           label: 'Users' },
  { to: '/admin/ai-stylist',  icon: Sparkles,        label: 'AI Stylist Logs' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-56'
        } flex flex-col border-r border-border bg-surface transition-all duration-200 shrink-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/admin" className="font-serif text-xl text-primary tracking-tight">
              Testshop
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-secondary hover:text-primary transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-surface'
                    : 'text-secondary hover:bg-border/50 hover:text-primary'
                }`
              }
              title={label}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-secondary hover:text-primary transition-colors rounded hover:bg-border/50"
            title="Back to store"
          >
            <Store size={18} className="shrink-0" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-secondary hover:text-primary transition-colors rounded hover:bg-border/50"
            title="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface">
          <h2 className="text-sm font-medium text-secondary">Admin Panel</h2>
          <span className="text-xs text-secondary">
            {user?.name} <span className="text-accent uppercase tracking-wider">({user?.role})</span>
          </span>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
