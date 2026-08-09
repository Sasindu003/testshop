import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Tag, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/admin',             icon: LayoutDashboard, exact: true },
  { label: 'Products',   to: '/admin/products',    icon: ShoppingBag },
  { label: 'Orders',     to: '/admin/orders',      icon: ShoppingCart },
  { label: 'Coupons',    to: '/admin/coupons',     icon: Tag },
  { label: 'Users',      to: '/admin/users',       icon: Users },
  { label: 'AI Stylist', to: '/admin/ai-stylist',  icon: Sparkles },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-xl font-serif text-primary tracking-wide">TESTSHOP Admin</h2>
        <p className="text-xs text-secondary font-sans mt-1">Logged in as {user?.role}</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 font-sans">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                isActive
                  ? 'bg-primary text-surface'
                  : 'text-secondary hover:bg-border hover:text-primary'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded text-sm font-sans font-medium text-error hover:bg-error/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ── Mobile Header ────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between bg-surface border-b border-border p-4 sticky top-0 z-20">
        <h2 className="text-lg font-serif text-primary">TESTSHOP Admin</h2>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 max-w-[80vw] bg-surface h-full shadow-xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-4 text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border shrink-0 sticky top-0 h-screen flex-col">
        <SidebarContent />
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden min-w-0 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
