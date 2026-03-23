# SmartPOS

A full-featured Point-of-Sale system built with **Laravel 11** (API backend) and **React 18 + Vite** (frontend). Supports role-based access, real-time sales processing, inventory management, reporting, and customer tracking.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Setup & Installation](#setup--installation)
3. [Default Login Credentials](#default-login-credentials)
4. [Feature Overview](#feature-overview)
5. [Testing Each Module](#testing-each-module)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, Laravel Sanctum (auth), SQLite / MySQL |
| Frontend | React 18, Vite, React Router v7, Axios |
| Styling | Tailwind CSS v4 |
| Icons | Heroicons v2 |
| Charts | Recharts |

---

## Setup & Installation

### Prerequisites

- PHP ≥ 8.2 + Composer
- Node.js ≥ 20 + npm
- SQLite (default) or MySQL

---

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

**Configure `.env`** (SQLite default — easiest for local dev):

```env
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database/database.sqlite
```

> Create an empty SQLite file first if needed:
> ```bash
> touch database/database.sqlite   # Linux/macOS
> ni database/database.sqlite      # PowerShell
> ```

```bash
# Run migrations and seed demo data
php artisan migrate:fresh --seed

# Create storage symlink (required for product/avatar images)
php artisan storage:link

# Start the API server
php artisan serve
# → API available at http://localhost:8000/api
```

---

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
# → App available at http://localhost:5173
```

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@pos.com | password |
| **Manager** | manager@pos.com | password |
| **Cashier** | cashier@pos.com | password |

---

## Feature Overview

### ✅ Implemented Features

#### 1. Authentication & Security
- JWT-like token auth via **Laravel Sanctum**
- Role-based access: `admin`, `manager`, `cashier`
- Rate limiting: login (10 req/min), register (5 req/min)
- Protected routes on both backend (middleware) and frontend (React Router guards)

#### 2. Dashboard (`/dashboard`)
- **KPIs**: Total sales today, total orders today, total products, total customers, total users
- **Sales Chart**: 7-day daily revenue line chart (Recharts)
- **Top 5 Products**: Most sold products in the last 30 days with revenue
- **Low Stock Alerts**: Products below threshold with quick link to inventory

#### 3. POS / Checkout (`/pos`)
- Interactive product grid with **real-time search** (by name, SKU, or barcode)
- **Category filter** pills for fast product selection
- **Barcode scanner** support (keyboard wedge scanners auto-add products)
- Products sorted by **most frequently ordered** (localStorage persistence)
- **Cart**: add, remove, adjust quantity with stock enforcement
- **Hold & Resume order** (persisted in localStorage)
- **Payment methods**: Cash (with change calculation), Card (with installments), QR (exact amount)
- Optional **customer selection** at checkout (links order to customer)
- **Receipt** generation with print support (`window.print()`)
- 8% tax applied automatically

#### 4. Order Management (`/orders`)
- Paginated order list with search by order number or customer name
- **Status badge**: completed / cancelled
- Date filter and time filter
- **Order detail modal**: items, quantities, prices, subtotals, payment info
- **Cancel order**: restores stock and logs inventory reversal movement
- **Export order to CSV** (`/orders/{id}/csv`)

#### 5. Customer Management (`/customers`)
- CRUD: create, view, edit, delete customers
- Fields: Name (required), Email, Phone, Address
- Client-side validation + server-side unique email/phone checks
- Inline field error display (no alert popups)

#### 6. Product Management (`/admin/products`) — Admin/Manager only
- CRUD with image upload (stored in `storage/app/public/products/`)
- Fields: Name, SKU (unique), Barcode, Category, Selling Price, Cost Price, Discount (%), Stock, Low Stock Threshold, Description, Active status
- Client-side validation: price > 0, selling price ≥ cost price, stock ≥ 0, discount 0–100
- Low-stock filter (linked from Dashboard)
- Product discount applied automatically in POS cart

#### 7. Category Management (`/admin/categories`) — Admin/Manager only
- CRUD: name, description, active status (toggle)
- Active/inactive badge on category cards
- Product count displayed per category

#### 8. Inventory Tracking (`/inventory`) — Admin/Manager only
- Automatic movement logging on every sale (`sale`) and cancellation (`return`)
- Type filter pills: All / Sale / Return / In / Out / Adjust
- Product search filter

#### 9. Payments (`/payments`) — Admin/Manager only
- Paginated payment records with method filter (All / Cash / Card / QR)
- Displays: Order No (clickable link to Orders), amount, method, date
- Links directly to the related order for full context

#### 10. User Management (`/admin/users`) — Admin/Manager only
- CRUD for system users
- Avatar upload support
- Role assignment: admin / manager / cashier
- Cannot delete your own account

#### 11. Profile (`/profile`)
- Update display name
- Change password (optional — leave blank to keep current)
- Upload profile avatar
- Fields are independent — update only what changed

#### 12. Reporting
- **GET** `/api/reports/dashboard` — KPIs, top products, sales chart
- **GET** `/api/reports/sales-chart` — 7-day sales data for charts

---

## Testing Each Module

### Authentication

```
1. Visit http://localhost:5173
2. Log in with admin@pos.com / password → should land on Dashboard
3. Log out → try accessing /pos directly → should redirect to Login
4. Test Cashier login (cashier@pos.com) → /admin/users should show "Forbidden"
```

### POS Checkout

```
1. Go to /pos
2. Search for a product by name or SKU
3. Click a product card → it appears in the cart
4. Adjust quantity with +/- buttons
5. Click "Checkout" → select Cash, enter amount ≥ total
6. Confirm → receipt modal appears with change
7. Test "Hold" → cart clears, "Resume" button appears → click to restore cart
8. Test "QR" payment → no amount input needed
9. Test "Card" → select installment option
10. After checkout, verify product stock decreased on /admin/products
```

### Order Management

```
1. Go to /orders
2. Find a completed order → click to expand detail
3. Click "Cancel" → confirm → status changes to "cancelled"
4. Go to /inventory → verify a "return" movement was logged
5. Go to /admin/products → verify stock was restored
6. Click the download CSV icon on an order
```

### Customers

```
1. Go to /customers → click "Add Customer"
2. Submit with no name → "Name is required" error appears inline
3. Enter invalid email → error shown without hitting server
4. Submit valid name only (email/phone optional) → customer created
5. Edit customer → change name only → 200 OK (email unique rule skipped for unchanged values)
```

### Products

```
1. Go to /admin/products → click "Add Product"
2. Leave name blank → "Product name is required" shown
3. Set selling price < cost price → error shown
4. Upload an image → save → image appears in POS grid
5. Set stock to 0 → go to POS → product shows "Out of Stock"
```

### Categories

```
1. Go to /admin/categories → click "Add Category"
2. Submit blank name → inline error shown
3. Add valid category → list refreshes and new card appears
4. Toggle "Active" → inactive categories are filtered out in POS
5. Edit a category → change name → save → card updates
```

### Inventory

```
1. Process a sale in POS
2. Go to /inventory → a "sale" movement appears for each product sold
3. Cancel the order in /orders
4. Go to /inventory → "return" movements appear, quantity restored
```

### Reports / Dashboard

```
1. Go to /dashboard → KPI cards load (sales today, orders, products, customers)
2. Sales chart shows last 7 days — oldest day on the left
3. Top Products section lists best sellers
4. Low Stock card links to /inventory?filter=low_stock
```

### Payments

```
1. Go to /payments → list of all payments
2. Filter by "Cash" pill → only cash payments shown
3. Click an order number → navigates to /orders?search=ORD-...
```

### User Management

```
1. Go to /admin/users → click "Add User"
2. Leave email blank → "Email address is required" shown
3. Password < 8 chars → error shown
4. Create a cashier → log in as cashier → /admin/users is inaccessible
5. Edit user → change role to manager → save → permissions update on next login
```

### Profile

```
1. Go to /profile
2. Change name only → "Save Changes" → success
3. Change password only → save → log out → log back in with new password
4. Upload avatar → save → avatar appears in sidebar
```

---

## User Roles & Permissions

| Feature | Admin | Manager | Cashier |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| POS / Checkout | ✅ | ✅ | ✅ |
| Orders (view + cancel) | ✅ | ✅ | ✅ |
| Customers (CRUD) | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ❌ |
| Products (CRUD) | ✅ | ✅ | ❌ |
| Categories (CRUD) | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅ | ❌ |
| Profile | ✅ | ✅ | ✅ |

---

## Known Limitations

| Area | Limitation |
|---|---|
| **Profile Image Upload** | Avatar update uses method spoofing (`POST` with `_method=PUT`). If the image validation error occurs, refresh and retry — the backend correctly ignores `avatar` when no file is sent. |
| **Database Locking (SQLite)** | SQLite may lock during concurrent writes. If you see `database is locked` on checkout, switch to MySQL for production use: set `DB_CONNECTION=mysql` in `.env`. |
| **Order-Level Discount** | Discounts are applied per-product (product discount %). There is no global order-level coupon or discount field. |
| **Date-Range Reporting** | The sales chart is fixed at 7 days. There is no date picker for custom report ranges. |
| **Receipt Email** | Receipts can be printed via browser print. Email delivery to customers is not implemented. |
| **Settings Page** | There is no dedicated settings page. Tax rate (8%), currency symbol, and business name are hardcoded in the frontend. |
| **Card Payments** | Card and installments are recorded but not integrated with any real payment gateway. |
| **Barcode Scanner** | Supports keyboard-wedge (HID) scanners only. USB serial or Bluetooth SDK scanners require additional integration. |
| **Multi-Branch** | All data is single-tenant/single-branch. Multi-location support is not implemented. |
| **Stock Adjustments** | Manual stock adjustments (e.g., stock takes) must be done by editing the product directly. There is no dedicated adjustment workflow with reason codes. |
