import React, { useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Gem, LogOut, Shield, User } from 'lucide-react';

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname === '/profile' || location.pathname === '/admin';

  // Distraction-free Login & Register view
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
        {children}
      </div>
    );
  }

  // Clean Decent Profile & Admin View without Search Bar or standard Navbar
  if (isDashboardPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Minimal Clean Header with ONLY Home Button */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm py-4 px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-blue-600 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 p-0.5 flex items-center justify-center text-white">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 hidden sm:inline">
                SHOP<span className="text-slate-600">LARVO</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-500 hover:border-red-200 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-12 py-8">
          {children}
        </main>

        <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
          © 2026 ShopLarvo Inc. Executive Dashboard Portal.
        </footer>
      </div>
    );
  }

  // Standard Store Pages View with Scroll-to-Hide Navbar
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <main className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-12 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
