# ShopLarvo Architecture Overview

This document describes the high-level architecture, data flow, and key design decisions behind ShopLarvo.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                  │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │  Static Build (Vite)│  │  Serverless Function     │  │
│  │  React 18 SPA       │  │  Express.js API          │  │
│  │  TailwindCSS        │  │  /api/*                  │  │
│  └─────────┬───────────┘  └──────────┬───────────────┘  │
└────────────┼─────────────────────────┼──────────────────┘
             │ fetch()                 │
             │                         ▼
             │              ┌─────────────────────┐
             │              │  MongoDB Atlas       │
             │              │  (Primary Database)  │
             │              └─────────────────────┘
             ▼
      ┌──────────────┐
      │   Browser    │
      │  localStorage│  ← Cart, Wishlist, Auth token
      └──────────────┘
```

---

## Directory Map

```
shoplarvo/
├── api/index.js              # Vercel serverless entrypoint (re-exports Express app)
├── server.js                 # Express app definition & middleware chain
├── config/
│   └── db.js                 # MongoDB Atlas connection client
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer token verification
│   ├── roleMiddleware.js     # Role-based access control (admin, staff)
│   └── errorMiddleware.js    # Centralized error handler
├── models/                   # Mongoose schemas (MongoDB)
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   └── Order.js
├── controllers/              # Business logic per resource
│   ├── authController.js     # Register, Login, Profile, Addresses
│   ├── productController.js  # CRUD products + stock management
│   ├── categoryController.js # Category listing
│   ├── orderController.js    # Order placement & tracking
│   └── adminController.js    # Admin dashboard data
├── routes/                   # Express Router files
│   ├── authRoutes.js         # /api/auth/*
│   ├── productRoutes.js      # /api/products/*
│   ├── categoryRoutes.js     # /api/categories/*
│   ├── orderRoutes.js        # /api/orders/*
│   ├── adminRoutes.js        # /api/admin/*
│   └── recommendationRoutes.js  # /api/recommendations/*
├── seed/                     # DB seeder scripts
│   └── seeder.js             # Seed data via MongoDB
├── client/                   # Vite + React 18 frontend
│   ├── src/
│   │   ├── App.js            # Router & provider tree
│   │   ├── api/              # Fetch wrappers per resource
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── components/       # Layouts, common UI (Navbar, Footer, Modals)
│   │   ├── pages/            # Route-level views (Home, Shop, Cart, Profile, Admin)
│   │   └── epics/            # Feature modules organized by epic
│   │       ├── E1_CustomerManagement/   # Login, Register
│   │       ├── E2_ProductAndInventory/  # ManageProducts
│   │       ├── E3_ShoppingAndOrders/    # Checkout, OrderTracking
│   │       └── E4_AdminAndReports/      # Dashboard, Analytics
│   ├── tailwind.config.js
│   └── vite.config.js
├── vercel.json               # Build & route config for Vercel deployment
└── docs/                     # Project documentation
```

---

## Data Flow: Shop Page Filtering

The Shop page filtering is **100% client-side** against a `mockCatalog` array. No API call is made for filtering.

```
User interacts with sidebar filter
       │
       ▼
useState setter called  (e.g. setSelectedCategory('Formal Wear'))
       │
       ▼
Component re-renders
       │
       ▼
mockCatalog.filter(product => {
  matchesDept     ← selectedDepartment (from CartContext)
  matchesCat      ← selectedCategory
  matchesColor    ← selectedColor
  matchesSize     ← selectedSize
  matchesPrice    ← maxPrice (range slider)
  matchesSearch   ← searchQuery (text input + URL param)
  matchesWishlist ← showWishlistOnly toggle
  
  return ALL conditions must be true (AND logic)
})
       │
       ▼
.sort() by sortBy state  (featured | price-low | price-high | rating)
       │
       ▼
filtered[] → mapped to product cards in JSX grid
```

### Filter Dimensions

| Filter | State Variable | UI Control | Logic |
|--------|---------------|------------|-------|
| Department | `selectedDepartment` (CartContext) | 3-button toggle (ALL/WOMEN/MEN) | Exact match on `product.gender`, UNISEX passes all |
| Category | `selectedCategory` | Button list (sidebar) | Exact match on `product.category` |
| Color | `selectedColor` | `<select>` dropdown | `product.colors.includes(value)` |
| Size | `selectedSize` | Button pills | `product.sizes.includes(value)` |
| Price | `maxPrice` | Range slider (20–300) | `product.price <= maxPrice` |
| Search | `searchQuery` | Text input + URL `?search=` | Case-insensitive `title.includes()` |
| Wishlist | `showWishlistOnly` | Toggle button | `isInWishlist(product._id)` from CartContext |

### Sort Options

| Value | Behavior |
|-------|----------|
| `featured` | Original catalog order (no-op sort, returns `0`) |
| `price-low` | Ascending by `price` |
| `price-high` | Descending by `price` |
| `rating` | Descending by `rating` |

---

## Authentication Flow

```
Register/Login form
       │
       ▼
authApi.js → POST /api/auth/register or /api/auth/login
       │
       ▼
authController.js → bcrypt hash/compare, generate JWT
       │
       ▼
Response: { success, token, user }
       │
       ▼
AuthContext stores token + user in state & localStorage
       │
       ▼
Subsequent API calls include: Authorization: Bearer <token>
       │
       ▼
authMiddleware.js verifies JWT on protected routes
```

---

## State Management

| Context | Purpose | Persistence |
|---------|---------|-------------|
| `AuthContext` | User session, token, login/register/logout | `localStorage` (`stylehub_token`, `stylehub_user`) |
| `CartContext` | Cart items, wishlist, department filter | `localStorage` (`stylehub_cart`, `stylehub_wishlist`) |

Both contexts persist to `localStorage` via `useEffect` syncs and hydrate from storage on initial load.

---

## API Route Map

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/profile` | Bearer | Get user profile |
| PUT | `/api/auth/profile` | Bearer | Update profile |
| GET | `/api/products` | Public | List all products |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | Public | List categories |
| POST | `/api/orders` | Bearer | Place order |
| GET | `/api/orders` | Bearer | User's orders |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/recommendations` | Bearer | AI outfit suggestions |
| GET | `/api/health` | Public | Server health check |

---

## Deployment

- **Platform**: Vercel (serverless)
- **Backend**: `api/index.js` re-exports the Express app as a Vercel serverless function
- **Frontend**: Vite builds to `client/dist/`, served as static assets
- **Routing**: `vercel.json` routes `/api/*` to the function, everything else to the SPA
- **Domain**: `shoplarvo.com` via Porkbun DNS (A record + CNAME)
