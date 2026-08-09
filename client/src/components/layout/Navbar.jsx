import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, LogIn, LogOut,
  ChevronDown, Menu, X, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/**
 * Navbar props:
 *   categories: [{ _id, name, slug }]  — from API, never hardcoded
 */
export default function Navbar({ categories = [] }) {
  const { isAuthenticated, isAdminOrOwner, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const shopRef = useRef(null);
  const accountRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (shopRef.current && !shopRef.current.contains(e.target)) setShopOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand ────────────────────────────────────────── */}
          <Link
            to="/"
            className="font-serif text-2xl tracking-tight text-primary hover:text-accent transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
          >
            Testshop
          </Link>

          {/* ── Desktop nav ──────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-sans font-medium text-secondary flex-1">

            {/* Shop dropdown */}
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => setShopOpen((o) => !o)}
                onKeyDown={(e) => e.key === 'Escape' && setShopOpen(false)}
                aria-haspopup="true"
                aria-expanded={shopOpen}
                className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded px-1"
              >
                Shop <ChevronDown size={14} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>

              {shopOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded border border-border shadow-lg py-1 z-50">
                  <Link
                    to="/products"
                    onClick={() => setShopOpen(false)}
                    className="block px-4 py-2 text-sm text-primary hover:bg-background transition-colors focus-visible:outline-none focus-visible:bg-background"
                  >
                    All Products
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat._id}`}
                      onClick={() => setShopOpen(false)}
                      className="block px-4 py-2 text-sm text-primary hover:bg-background transition-colors focus-visible:outline-none focus-visible:bg-background"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/ai-stylist"
              className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded px-1"
            >
              <Sparkles size={14} /> AI Stylist
            </Link>

            {isAdminOrOwner && (
              <Link
                to="/admin"
                className="hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded px-1"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* ── Search (desktop) ─────────────────────────────── */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                aria-label="Search products"
                className="w-48 lg:w-64 pl-3 pr-9 py-1.5 text-sm border border-border rounded bg-background text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* ── Icon actions ─────────────────────────────────── */}
          <div className="flex items-center gap-3 text-primary shrink-0">
            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                >
                  <Heart size={20} />
                </Link>

                <Link
                  to="/cart"
                  aria-label={`Cart (${totalItems} items)`}
                  className="relative hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] font-sans font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Account dropdown */}
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  onKeyDown={(e) => e.key === 'Escape' && setAccountOpen(false)}
                  aria-haspopup="true"
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                  className="hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                >
                  <User size={20} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded border border-border shadow-lg py-1 z-50">
                    <p className="px-4 py-2 text-xs text-secondary truncate border-b border-border">{user?.name}</p>
                    <Link to="/profile" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-primary hover:bg-background transition-colors focus-visible:outline-none focus-visible:bg-background">Profile</Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-primary hover:bg-background transition-colors focus-visible:outline-none focus-visible:bg-background">My Orders</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-background transition-colors focus-visible:outline-none focus-visible:bg-background flex items-center gap-2 border-t border-border mt-1">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in"
                className="hidden md:flex items-center gap-1 text-sm font-sans font-medium hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
              >
                <LogIn size={18} /> Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-3 pb-2">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full pl-3 pr-9 py-2 text-sm border border-border rounded bg-background text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <button type="submit" aria-label="Submit search" className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary focus-visible:outline-none">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Mobile links */}
          <nav className="px-4 pb-4 space-y-1 text-sm font-sans font-medium">
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">All Products</Link>
            {categories.map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat._id}`} onClick={() => setMobileOpen(false)} className="block py-2 text-secondary hover:text-primary transition-colors pl-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">{cat.name}</Link>
            ))}
            <Link to="/ai-stylist" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"><Sparkles size={14} />AI Stylist</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Profile</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">My Orders</Link>
                {isAdminOrOwner && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Dashboard</Link>}
                <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"><LogOut size={14} />Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 py-2 text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"><LogIn size={14} />Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
