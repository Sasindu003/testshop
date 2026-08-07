# 🛍️ ShopLarvo - Smart Clothing Shop Management System

[![Live Store](https://img.shields.io/badge/Live_Store-shoplarvo.com-blue?style=for-the-badge&logo=vercel)](https://shoplarvo.com)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-emerald?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Stack](https://img.shields.io/badge/Stack-MERN_%2B_Vite-slate?style=for-the-badge&logo=react)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

> **ShopLarvo Executive Edition** is a full-stack, enterprise-grade e-commerce application built with React, Node.js, Express, and MongoDB. Designed for high-end fashion boutiques, streetwear drops, and tailored suit outlets.

---

## ✨ Features Highlight

### 🔐 1. Customer Authentication & Security (Epic 1)
- **100% Full-Screen Editorial Auth UI**: Distraction-free luxury split-screen Login & Registration interfaces.
- **Instant Email Existence Pre-Check**: Checks email uniqueness on Step 1 before proceeding to security steps.
- **Strict Password Security Meter**: Enforces minimum 3 out of 4 criteria (Min 8 chars, 1 uppercase, 1 digit, 1 special symbol).
- **Phone Uniqueness Validation**: Primary Mobile Phone and Secondary Phone cannot be identical.
- **Address Book Management**: Multi-address manager with default shipping address toggles.

### 👗 2. Product Catalog & Smart Inventory (Epic 2)
- **Executive Product Showcase**: High-resolution imagery, quick-view modals, size/color variant selector.
- **Dynamic Department Filtering**: Filter by Women, Men, Streetwear, Bespoke Suits, Footwear, and Accessories.
- **Stock Management**: Live stock tracking, low-stock warnings, and out-of-stock badges.

### 🛒 3. Shopping Cart & Multi-Step Checkout (Epic 3)
- **Slide-out Cart & Wishlist**: Real-time item count badges and price calculation.
- **3-Step Checkout Stepper**: Shipping address selection, payment method selection, and order review.
- **Invoice & Live Order Tracking**: Printable invoice view and real-time order status tracking bar.

### 🛡️ 4. Executive Admin Portal & Analytics (Epic 4)
- **Decent Admin Dashboard Header**: Distraction-free clean header with single **"← Home"** navigation link.
- **Sales & Revenue Analytics**: Interactive chart visualizations for revenue, top categories, and daily sales.
- **Product & Employee Manager**: CRUD operations for inventory management and staff permissions.
- **AI Outfit Stylist Advisor**: AI-powered personalized clothing recommendations widget.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TailwindCSS, Lucide Icons, Context API |
| **Backend Server** | Node.js, Express.js (REST API, CORS, Dotenv) |
| **Database** | **MongoDB Atlas** (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js (Password Hashing) |
| **Hosting & Deployment** | Vercel (CD/CI Serverless Functions), Porkbun Custom DNS (`shoplarvo.com`) |

---

## 📁 Repository Structure

```
Smart Clothing Shop Management System/
├── client/                      # Vite + React Frontend Application
│   ├── src/
│   │   ├── api/                 # Axios/Fetch API Services
│   │   ├── components/          # Reusable UI Components (Navbar, Footer, Modals)
│   │   ├── context/             # AuthContext & CartContext
│   │   ├── epics/               # Core Application Feature Modules (E1-E4)
│   │   └── pages/               # Page Views (Home, Shop, Cart, Profile, Admin)
│   └── vite.config.js
├── config/                      # MongoDB Connection Client
│   └── db.js
├── controllers/                 # Express REST API Controllers
├── middleware/                  # JWT Auth & Role Authorization Middleware
├── models/                      # Mongoose Data Models
├── routes/                      # API Route Handlers (/api/auth, /api/products, etc.)
├── seed/                        # Database Seeder Scripts
├── api/                         # Vercel Serverless Function Entrypoint
├── server.js                    # Node.js Server Entry Point
└── vercel.json                  # Vercel Deployment & SPA Rewrite Config
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster or Local MongoDB instance

### 2. Clone Repository
```bash
git clone https://github.com/lakshan101/shoplarvo.git
cd shoplarvo
```

### 3. Environment Variables Setup
Create a `.env` file in the root folder:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=shoplarvo_super_secret_jwt_key_2026_fashion_shop
MONGO_URI=mongodb://127.0.0.1:27017/stylehub_db
```

### 4. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 5. Initialize Sample Database Data
```bash
# Seed initial sample data to MongoDB
npm run seed
```

### 6. Run Development Servers
```bash
# Run Express backend server (Port 5000)
npm run dev

# In a new terminal, run Vite frontend server (Port 3000)
cd client
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## 🌐 Live Production Deployment

### Deploying on Vercel
1. Push code to GitHub: `git push origin main`
2. Import repository on [Vercel](https://vercel.com).
3. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`.
4. Click **Deploy**.

### Custom Domain Configuration (`shoplarvo.com`)
Add the following DNS records in your domain registrar (Porkbun / Namecheap):

| Record Type | Host | Answer / Target |
| :--- | :--- | :--- |
| **A Record** | `@` | `216.198.79.1` |
| **CNAME Record** | `www` | `3a53a5efc165266b.vercel-dns-017.com.` |

----

## 📄 License & Copyright

© 2026 **ShopLarvo Inc.** All rights reserved. Built by Lakshan & Engineering Team.
Licensed under the [MIT License](LICENSE).
