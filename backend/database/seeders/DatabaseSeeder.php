<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\InventoryMovement;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Users (so you can log in)
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $manager = User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@pos.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        $cashier = User::factory()->create([
            'name' => 'Cashier One',
            'email' => 'cashier@pos.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // Generate some extra random users
        User::factory(5)->create(['role' => 'cashier']);

        // 2. Default Walk-in Customer
        Customer::factory()->create([
            'name' => 'Walk-in Customer',
            'phone' => null,
            'email' => null,
        ]);

        // Generate more random customers
        Customer::factory(20)->create();

        // 3. Categories and Products using Factories
        // Generate 10 categories, each containing 15-30 products
        Category::factory(10)->create()->each(function (Category $category) {
            Product::factory(rand(15, 30))->create([
                'category_id' => $category->id
            ]);
        });

        // 4. Optionally: create some random previous orders for historical data
        $this->createHistoricalOrders($cashier);

        echo "Database Seeder With Factories Completed successfully.\n";
    }

    private function createHistoricalOrders(User $cashier): void
    {
        $products = Product::inRandomOrder()->take(50)->get();
        $customers = Customer::all();

        // Create 30 historical orders
        for ($i = 0; $i < 30; $i++) {
            $customer = $customers->random();
            $orderDate = fake()->dateTimeBetween('-30 days', 'now');

            // Pick 1 to 5 random products for this order
            $orderProducts = $products->random(rand(1, 5));
            $subtotal = 0;

            $order = Order::create([
                'order_no' => Order::generateOrderNo($orderDate->format('Y-m-d H:i:s')),
                'customer_id' => fake()->boolean(70) ? $customer->id : null, // 70% chance of customer, else walk-in
                'user_id' => $cashier->id,
                'subtotal' => 0, // will be calculated below
                'discount_amount' => 0,
                'tax' => 0,
                'total' => 0,
                'status' => 'completed',
                'paid_at' => $orderDate,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            foreach ($orderProducts as $product) {
                $qty = rand(1, 4);
                $itemSubtotal = $product->discounted_price * $qty;
                $subtotal += $itemSubtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $qty,
                    'price' => $product->price,
                    'discount' => $product->discount,
                    'subtotal' => $itemSubtotal,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Create inventory movement
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'user_id' => $cashier->id,
                    'order_id' => $order->id,
                    'type' => 'sale',
                    'quantity' => $qty,
                    'stock_before' => $product->stock + $qty, // Approximate
                    'stock_after' => $product->stock,
                    'description' => "Sale from historical order #{$order->order_no}",
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);
            }

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);

            // Add payment
            Payment::create([
                'order_id' => $order->id,
                'amount' => $subtotal,
                'change' => 0,
                'method' => fake()->randomElement(['cash', 'card', 'qr']),
                'reference' => null,
                'paid_at' => $orderDate,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);
        }
    }
}
