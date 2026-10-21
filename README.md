# Voltrix Electronics ⚡

> **Premium Modern Full-Stack Electronics Marketplace & AI-Powered Shopping Platform**  
> Inspired by the operational depth of Moglix and the sleek, polished design of next-gen D2C tech brands.

---

## 🚀 Key Highlights & Architectural Overview

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React icons, responsive mobile-first UI.
- **Backend**: Node.js, Express.js REST API architecture, Type-safe TypeScript, JWT session tokens, bcrypt password hashing.
- **Database**: Prisma ORM with SQLite (`dev.db`, zero-config out-of-the-box) or PostgreSQL (switchable in `.env`).
- **AI Shopping Concierge ("Voltrix AI")**:
  - Dual-tier intelligence: built-in deterministic NLP tool calling (supports English and Hinglish, e.g., *"Bhai 60,000 ke andar best laptop dikha aur HP vs Lenovo compare kar"*) + optional Gemini / OpenAI API integration.
  - Connected to backend database tools: `searchProducts()`, `getProductDetails()`, `compareProducts()`, `checkProductStock()`, `getUserOrders()`, `getOrderStatus()`.
  - Renders live interactive product cards, side-by-side comparison tables, and real-time transit telemetry cards.
- **Order Tracking & Milestones**:
  - Unique Order IDs (`ORD-2026-XXXXXX`) and Tracking IDs (`TRK-IN-XXXXXXXX`).
  - Visual timeline: `Order Placed` ➔ `Confirmed` ➔ `Processing` ➔ `Packaged` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`.
- **Protected Admin Operations Console (`/admin`)**:
  - Separate authentication from regular customers.
  - Gross sales, order count, and monthly revenue run-rate charts.
  - Product catalog management (add via external image URL or upload, edit specifications JSON, adjust stock counters, delete with confirmation).
  - Order dispatching (assign or edit tracking numbers, update statuses, publish timestamped telemetry log events).
  - Coupon & voucher management (percentage/fixed discounts, minimum cart values, usage caps).

---

## 🔑 Demo Credentials

| Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Store Operations Admin** | `admin@voltrix.com` | `admin123` | `http://localhost:3000/admin/login` |
| **Verified Customer** | `user@voltrix.com` | `password123` | `http://localhost:3000/login` |

*(Convenient one-click autofill buttons are built directly into both login screens!)*

---

## 🛠️ Quick Start Guide

### 1. Install Dependencies
```bash
# In project root
npm install

# In server
cd server && npm install

# In client
cd ../client && npm install
```

### 2. Seed the Database
Populate 36+ realistic electronics products across 8 categories with Indian pricing in ₹ INR, sample reviews, coupons, and orders:
```bash
cd server
npm run prisma:generate
npm run seed
```

### 3. Start Development Servers
From the root directory, start both the Express REST API (port 5001) and Next.js (port 3000) concurrently:
```bash
npm run dev
```
Or start individually:
```bash
# Terminal 1 (Backend API)
cd server && npm run dev

# Terminal 2 (Next.js Frontend)
cd client && npm run dev
```

Visit the application at: **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Repository Structure

```
voltrix-electronics/
├── client/                     # Next.js 14 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Homepage (Hero, Categories, Deal of Day, Featured, Trending)
│   │   │   ├── products/       # Catalog Hub (Filters, Sorting, Price Slider, Stock filter)
│   │   │   │   └── [slug]/     # Product Details (Gallery zoom, specs table, comparison tool)
│   │   │   ├── cart/           # Shopping Cart & Coupon validation
│   │   │   ├── checkout/       # 4-Step Checkout (Address, Delivery speed, Payment, Confirmation)
│   │   │   ├── track-order/    # Live Order Tracking & Milestones
│   │   │   ├── ai-assistant/   # Dedicated Voltrix AI Shopping Page
│   │   │   ├── account/        # User Dashboard (Orders, Addresses, Coupons)
│   │   │   ├── deals/          # Deals & Active Vouchers Hub
│   │   │   ├── contact/        # Contact Us (Interactive Google Maps, Direct CTAs)
│   │   │   ├── wishlist/       # Saved Wishlist with 1-click move-to-cart
│   │   │   ├── login/          # Customer Login
│   │   │   ├── register/       # Customer Registration
│   │   │   └── admin/          # Protected Admin Operations Portal
│   │   │       ├── login/      # Admin Login
│   │   │       ├── products/   # Catalog & Stock Management
│   │   │       ├── orders/     # Order Dispatch & Tracking Management
│   │   │       └── coupons/    # Coupon & Promo Code Management
│   │   ├── components/         # Reusable UI components (Navbar, Footer, AIAssistantWidget, etc.)
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── lib/                # API client with token helpers
│   │   └── types/              # Full TypeScript interfaces
├── server/                     # Express REST API Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Relational schema (17 models)
│   │   ├── seed.ts             # 36+ realistic electronics products seed script
│   │   └── dev.db              # SQLite database file
│   └── src/
│       ├── controllers/        # REST route controllers
│       ├── middleware/         # JWT authentication & admin route guards
│       ├── routes/             # Express route declarations
│       ├── services/           # Intelligent AI tool-calling engine
│       └── index.ts            # Server entry point
├── .env.example                # Environment variables template
└── package.json                # Root concurrently runner
```

---

## 🛡️ Security & Enterprise Highlights

- **Server-Side Validation**: Product prices, discounts, and coupon calculations are strictly enforced on the backend. Frontend prices are never trusted.
- **Role-Based Guards**: Admin endpoints are isolated behind `ADMIN_JWT_SECRET` tokens and rejected if unauthorized.
- **AI Tool Boundaries**: The AI cannot execute arbitrary SQL queries or inspect other users' orders; it accesses strictly sandboxed parameter-validated functions.
