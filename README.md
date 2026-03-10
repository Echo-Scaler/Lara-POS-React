# SmartPOS

A modern Point of Sale (POS) system built with Laravel 11 and React + Vite.

## Features

- **Authentication**: Role-based access (Admin, Manager, Cashier) using Laravel Sanctum.
- **Dashboard**: Real-time sales overview, top-selling products, and low stock alerts.
- **POS Screen**: Interactive product grid with search, filtering, barcode scanning support, and a realtime cart.
- **Order Management**: Process payments (Cash/Card/QR), view order history, cancel orders and restore stock.
- **Inventory Tracking**: Automatic stock deductions on sales, and logs of all inventory movements.
- **Admin Panel**: Full CRUD for Products, Categories, and Users.

## Setup Instructions

### Backend (Laravel)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy environment file and generate key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Configure your `.env` file to use an SQLite database (easiest for testing) or MySQL. By default, it uses SQLite.

   ```env
   DB_CONNECTION=sqlite
   # DB_DATABASE=/absolute/path/to/database.sqlite
   ```

   _(If using SQLite, create an empty `database/database.sqlite` file first)._

5. Run migrations and seed with test data (Factories):
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Start the backend server:

   ```bash
   php artisan serve
   ```

   _The API will be available at `http://localhost:8000/api`_

7. Storage Link (for product images):
   ```bash
   php artisan storage:link
   ```

### Frontend (React/Vite)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   _The app will be available at `http://localhost:5173`_

## Login Credentials (seeded data)

- **Admin**: `admin@pos.com` / `password`
- **Manager**: `manager@pos.com` / `password`
- **Cashier**: `cashier@pos.com` / `password`

## Stack

- Laravel 11
- React 18, React Router v7
- Vite
- TailwindCSS v4
- Axios
- Heroicons

