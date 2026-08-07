# Changelog

All notable changes to the ShopLarvo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.4.0] - 2026-08-07

### Added
- **`controllers/adminController.js`** — `getAdminStats` handler updated with real MongoDB aggregations:
  - Total revenue (`totalSales`): `$sum` of `totalAmount` excluding `status: 'Cancelled'`.
  - Total orders (`totalOrders`): count of documents in `Order`.
  - Orders by status (`ordersByStatus`): `$group` count of orders per status (`Pending Payment`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Low stock items (`lowStockProducts`): count of products where `stockCount <= lowStockThreshold`.
  - Total active customers (`totalCustomers`): count of registered customer users.
- **`client/src/epics/E4_AdminAndReports/AdminAnalytics.js`** — Updated component to handle loading states, empty database states, and render live aggregate metric cards + Order Fulfillment Status Breakdown visual card.

---

## [1.3.0] - 2026-08-07 ⚠️ Critical Fix

### Changed
- **`controllers/orderController.js`** — **Full rewrite.** Deleted `memoryOrders` array and every in-memory fallback branch. All four handlers (`createOrder`, `getMyOrders`, `getAllOrders`, `updateOrderStatus`) now return `503 Database unavailable` when MongoDB is not connected.
- **`controllers/orderController.js`** — `createOrder` validates stock availability for every `orderItem` **before** `Order.create()`. Insufficient stock → `400` with a list of items showing `requested` vs `available`.
- **`controllers/orderController.js`** — New orders are created with `status: 'Pending Payment'` instead of `'Processing'`.
- **`models/Order.js`** — Status enum updated from `['Pending','Processing','Shipped','Delivered','Cancelled']` to `['Pending Payment','Processing','Shipped','Delivered','Cancelled']`, default changed to `'Pending Payment'`.

### Added
- **`models/Payment.js`** (new) — Payment slip model: `order` (ObjectId, unique ref to Order), `slipImage` (`{ data: Buffer, contentType: String }`), `status` (enum `Pending`/`Approved`/`Rejected`), `rejectionReason`, `reviewedBy` (ref User), `reviewedAt`, `uploadedAt`. Stores slip binary data in MongoDB for Vercel serverless compatibility.

### Security
- No code path can now create or read orders without a live MongoDB connection — eliminates silent data loss from in-memory fallback.

---

## [1.2.0] - 2026-08-06

### Added
- **`controllers/productController.js`** — `adjustStock` handler: `PATCH /api/admin/products/:id/stock` accepts a `delta` (integer). Positive restocks, negative corrects. Rejected with `422` if the result would go below `0`. Uses `$inc` for atomicity on the Mongo path; in-memory fallback also validates before mutating.
- **`controllers/productController.js`** — `withLowStock(product)` helper: computes `isLowStock` at response time (`stockCount <= lowStockThreshold`, default threshold `5`). Threaded through `getProducts`, `getProductById`, and `adjustStock` — never stored on the document.
- **`routes/adminRoutes.js`** — Wired `PATCH /api/admin/products/:id/stock` under existing `protect` + `authorize('admin','staff')` guard.

---

## [1.1.0] - 2026-08-06

### Added
- **`controllers/userController.js`** (new) — Dedicated admin user-management controller keeping `authController.js` auth-only. Exposes:
  - `GET /api/admin/users` — paginated listing with `page`, `limit`, `search`, and `role` query filters.
  - `PATCH /api/admin/users/:id/status` — activate or deactivate any user account. Prevents self-deactivation.
- **`client/src/api/userApi.js`** (new) — Client-side fetch wrappers for the two new admin endpoints.
- **`models/User.js`** — Added `isActive: Boolean` field (default `true`); existing users are not affected.
- **`controllers/authController.js`** — Login gate: deactivated users receive `403 Account deactivated` instead of a token. `isActive` included in login/register response. Exposes `_getMemoryUsers()` helper for memory-fallback support in `userController`.
- **`routes/adminRoutes.js`** — Wired `GET /users` and `PATCH /users/:id/status` under existing `protect` + `authorize('admin','staff')` guard.
- **`epics/E1_CustomerManagement/CustomerList.js`** — Full rewrite: live API data, debounced search, role filter, pagination, and per-row **Status** toggle column (Active / Inactive badge with spinner).

### Security
- Customer-role tokens receive `403 Forbidden` on all `/api/admin/users` endpoints via existing `roleMiddleware`.

---

## [1.0.0] - 2026-08-06

### Added
- **Backend Architecture**: Express 4 server setup (`server.js`) with MongoDB Atlas connection (`config/db.js`).
- **Authentication System (Epic E1)**: User registration, login, JWT token auth middleware, and role-based access control.
- **Product Management (Epic E2)**: Mongoose schemas and API endpoints for product catalog operations.
- **Shopping & Orders (Epic E3)**: Shopping cart state management, order creation, and processing endpoints.
- **Admin Dashboard (Epic E4)**: Management routes and controllers for store admins.
- **Frontend SPA**: React 18 + Vite 5 client application integrated with TailwindCSS 3, Lucide Icons, and Context API (`AuthContext`, `CartContext`).
- **Deployment Configuration**: `vercel.json` and serverless API proxy handlers for Vercel deployment.
