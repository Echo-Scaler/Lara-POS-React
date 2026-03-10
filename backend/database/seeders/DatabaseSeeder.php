<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@pos.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        User::create([
            'name' => 'Cashier One',
            'email' => 'cashier@pos.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // 2. Categories
        $categories = [
            'Beverages',
            'Snacks',
            'Dairy',
            'Produce',
            'Meat',
            'Bakery'
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat,
                'slug' => Str::slug($cat),
                'is_active' => true,
            ]);
        }

        // 3. Products
        $products = [
            ['name' => 'Coca Cola 2L', 'price' => 2.50, 'cost_price' => 1.50, 'stock' => 100, 'category_id' => 1],
            ['name' => 'Orange Juice', 'price' => 3.00, 'cost_price' => 1.80, 'stock' => 50, 'category_id' => 1],
            ['name' => 'Potato Chips', 'price' => 1.50, 'cost_price' => 0.80, 'stock' => 200, 'category_id' => 2],
            ['name' => 'Chocolate Bar', 'price' => 1.20, 'cost_price' => 0.50, 'stock' => 150, 'category_id' => 2],
            ['name' => 'Whole Milk 1L', 'price' => 1.00, 'cost_price' => 0.60, 'stock' => 40, 'category_id' => 3],
            ['name' => 'Apples 1kg', 'price' => 4.00, 'cost_price' => 2.00, 'stock' => 30, 'category_id' => 4],
            ['name' => 'Chicken Breast 1kg', 'price' => 8.00, 'cost_price' => 5.00, 'stock' => 20, 'category_id' => 5],
            ['name' => 'Baguette', 'price' => 1.20, 'cost_price' => 0.40, 'stock' => 40, 'category_id' => 6],
            ['name' => 'Low Stock Item test', 'price' => 10.00, 'cost_price' => 5.00, 'stock' => 2, 'category_id' => 2],
        ];

        foreach ($products as $i => $prod) {
            Product::create([
                'name' => $prod['name'],
                'sku' => 'SKU-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'barcode' => '89012345' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'category_id' => $prod['category_id'],
                'price' => $prod['price'],
                'cost_price' => $prod['cost_price'],
                'stock' => $prod['stock'],
                'discount' => 0,
                'is_active' => true,
            ]);
        }

        // 4. Customers
        Customer::create([
            'name' => 'Walk-in Customer',
            'phone' => null,
            'email' => null,
        ]);

        Customer::create([
            'name' => 'John Doe',
            'phone' => '1234567890',
            'email' => 'john@example.com',
            'loyalty_points' => 150,
        ]);

        echo "Database Seeder Completed successfully.\n";
    }
}
