import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, ShoppingCart, Sparkles, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function PublicLayout() {
  const { isAuthenticated, isAdminOrOwner, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="font-serif text-2xl tracking-tight text-primary hover:text-accent transition-colors">
              Testshop
            </Link>

            {/* Nav centre */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-sans font-medium text-secondary">
              <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
              <Link to="/ai-stylist" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Sparkles size={14} /> AI Stylist
              </Link>
              {isAdminOrOwner && (
                <Link to="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 text-primary">
              <Link to="/products" className="hover:text-accent transition-colors" aria-label="Search">
                <Search size={20} />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="hover:text-accent transition-colors" aria-label="Wishlist">
                    <Heart size={20} />
                  </Link>
                  <Link to="/cart" className="relative hover:text-accent transition-colors" aria-label="Cart">
                    <ShoppingCart size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] font-sans font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" className="hover:text-accent transition-colors" aria-label="Profile">
                    <User size={20} />
                  </Link>
                  <button onClick={handleLogout} className="hover:text-accent transition-colors" aria-label="Logout">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-sm font-sans font-medium hover:text-accent transition-colors">
                  <LogIn size={18} /> Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-secondary font-sans">
          © {new Date().getFullYear()} Testshop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
