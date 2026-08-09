import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from './components/RouteGuards';

// ── Lazy-loaded pages (split bundles) ─────────────────────────────────────────
const HomePage       = React.lazy(() => import('./pages/HomePage'));
const LoginPage      = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage   = React.lazy(() => import('./pages/RegisterPage'));
const ProductsPage   = React.lazy(() => import('./pages/ProductsPage'));
const ProductPage    = React.lazy(() => import('./pages/ProductPage'));
const CartPage       = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage   = React.lazy(() => import('./pages/CheckoutPage'));
const OrdersPage     = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'));
const WishlistPage   = React.lazy(() => import('./pages/WishlistPage'));
const ProfilePage    = React.lazy(() => import('./pages/ProfilePage'));
const AiStylistPage  = React.lazy(() => import('./pages/AiStylistPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts  = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders    = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons   = React.lazy(() => import('./pages/admin/AdminCoupons'));
const AdminUsers     = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminStylistLogs = React.lazy(() => import('./pages/admin/AdminStylistLogs'));
const NotFoundPage   = React.lazy(() => import('./pages/NotFoundPage'));

const Suspense = ({ children }) => (
  <React.Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-secondary text-sm tracking-widest uppercase animate-pulse">Loading…</span>
    </div>
  }>
    {children}
  </React.Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/products"      element={<ProductsPage />} />
          <Route path="/products/:id"  element={<ProductPage />} />

          {/* Authenticated customer */}
          <Route path="/cart"          element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/checkout"      element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/orders"        element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:id"    element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
          <Route path="/wishlist"      element={<RequireAuth><WishlistPage /></RequireAuth>} />
          <Route path="/profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/ai-stylist"    element={<AiStylistPage />} />

          {/* Admin / Owner */}
          <Route path="/admin"               element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/products"      element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/orders"        element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
          <Route path="/admin/coupons"       element={<RequireAdmin><AdminCoupons /></RequireAdmin>} />
          <Route path="/admin/users"         element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
          <Route path="/admin/ai-stylist"    element={<RequireAdmin><AdminStylistLogs /></RequireAdmin>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
