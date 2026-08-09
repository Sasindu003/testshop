import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';

// ── Lazy-loaded pages (code-split) ────────────────────────────────────────────
const HomePage        = React.lazy(() => import('./pages/HomePage'));
const LoginPage       = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage    = React.lazy(() => import('./pages/RegisterPage'));
const ProductsPage    = React.lazy(() => import('./pages/ProductsPage'));
const ProductPage     = React.lazy(() => import('./pages/ProductPage'));
const CartPage        = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage    = React.lazy(() => import('./pages/CheckoutPage'));
const OrdersPage      = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const WishlistPage    = React.lazy(() => import('./pages/WishlistPage'));
const ProfilePage     = React.lazy(() => import('./pages/ProfilePage'));
const AiStylistPage   = React.lazy(() => import('./pages/AiStylistPage'));
const AdminDashboard  = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts   = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders     = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons    = React.lazy(() => import('./pages/admin/AdminCoupons'));
const AdminUsers      = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminStylistLogs = React.lazy(() => import('./pages/admin/AdminStylistLogs'));
const NotFoundPage    = React.lazy(() => import('./pages/NotFoundPage'));

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="text-secondary text-sm tracking-widest uppercase animate-pulse font-sans">
        Loading…
      </span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<SuspenseFallback />}>
        <Routes>

          {/* ═══════════ Public + Customer layout ═══════════════════════ */}
          <Route element={<PublicLayout />}>
            {/* Public */}
            <Route index               element={<HomePage />} />
            <Route path="login"        element={<LoginPage />} />
            <Route path="register"     element={<RegisterPage />} />
            <Route path="products"     element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductPage />} />
            <Route path="ai-stylist"   element={<AiStylistPage />} />

            {/* Customer-protected */}
            <Route path="cart"         element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="checkout"     element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="orders"       element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="orders/:id"   element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="wishlist"     element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* ═══════════ Admin / Owner layout ══════════════════════════ */}
          <Route
            path="admin"
            element={
              <RoleRoute roles={['admin', 'owner']}>
                <AdminLayout />
              </RoleRoute>
            }
          >
            <Route index              element={<AdminDashboard />} />
            <Route path="products"    element={<AdminProducts />} />
            <Route path="orders"      element={<AdminOrders />} />
            <Route path="coupons"     element={<AdminCoupons />} />
            <Route path="users"       element={<AdminUsers />} />
            <Route path="ai-stylist"  element={<AdminStylistLogs />} />
          </Route>

          {/* ═══════════ 404 ═══════════════════════════════════════════ */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
