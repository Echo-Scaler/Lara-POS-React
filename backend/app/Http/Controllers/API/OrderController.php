<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Order::with(['user:id,name', 'customer:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date')) {
            $query->forDate($request->date);
        }

        $orders = $query->latest()->paginate($request->get('per_page', 10));

        return OrderResource::collection($orders)->additional([
            'success' => true
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        DB::beginTransaction();

        try {
            $user = $request->user();
            $data = $request->validated();

            $subtotal = 0;
            $itemsData = [];

            // 1. Process items and check stock
            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new Exception("Insufficient stock for product: {$product->name}");
                }

                $discount = $item['discount'] ?? 0;
                $itemPrice = $item['price'];
                $itemSubtotal = ($itemPrice * (1 - $discount / 100)) * $item['quantity'];

                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'price' => $itemPrice,
                    'discount' => $discount,
                    'subtotal' => $itemSubtotal,
                    // For stock deduction later
                    'model' => $product,
                ];
            }

            // Real calculations (tax / global discount) could be added here
            $tax = 0;
            $discount_amount = 0;
            $total = $subtotal + $tax - $discount_amount;

            if ($data['amount_paid'] < $total) {
                throw new Exception("Amount paid is less than the total order amount");
            }

            // 2. Create Order
            $order = Order::create([
                'order_no' => Order::generateOrderNo(),
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discount_amount,
                'tax' => $tax,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            // 3. Create Order Items & Update Stock
            foreach ($itemsData as $item) {
                $product = $item['model'];

                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'product_sku' => $item['product_sku'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'],
                    'subtotal' => $item['subtotal'],
                ]);

                $stockBefore = $product->stock;
                $product->decrement('stock', $item['quantity']);

                // 4. Log Inventory Movement
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'type' => 'sale',
                    'quantity' => $item['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockBefore - $item['quantity'],
                    'description' => "Sale from Order #{$order->order_no}",
                ]);
            }

            // 5. Create Payment
            $change = $data['amount_paid'] - $total;
            $order->payments()->create([
                'amount' => $data['amount_paid'],
                'change' => $change > 0 ? $change : 0,
                'method' => $data['payment_method'],
                'reference' => $data['reference'] ?? null,
                'paid_at' => now(),
            ]);

            DB::commit();

            $order->load(['items', 'payments', 'customer', 'user']);

            return $this->successResponse(new OrderResource($order), 'Order completed successfully', 201);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Order $order)
    {
        $order->load(['items', 'payments', 'customer', 'user', 'inventoryMovements']);
        return $this->successResponse(new OrderResource($order));
    }

    public function cancel(Order $order, Request $request)
    {
        if ($order->status !== 'completed') {
            return $this->errorResponse('Only completed orders can be cancelled', 422);
        }

        DB::beginTransaction();

        try {
            $order->update(['status' => 'cancelled']);

            // Restore stock
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if ($product) {
                    $stockBefore = $product->stock;
                    $product->increment('stock', $item->quantity);

                    InventoryMovement::create([
                        'product_id' => $product->id,
                        'user_id' => $request->user()->id,
                        'order_id' => $order->id,
                        'type' => 'return',
                        'quantity' => $item->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockBefore + $item->quantity,
                        'description' => "Order #{$order->order_no} cancelled",
                    ]);
                }
            }

            DB::commit();

            return $this->successResponse(new OrderResource($order), 'Order cancelled successfully');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to cancel order: ' . $e->getMessage(), 500);
        }
    }

    public function exportCsv(Order $order)
    {
        $order->load(['items', 'payments', 'customer', 'user']);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="order-' . $order->order_no . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($order) {
            $file = fopen('php://output', 'w');

            // Order Details Section
            fputcsv($file, ['Order Summary']);
            fputcsv($file, ['Order No', $order->order_no]);
            fputcsv($file, ['Date', $order->created_at->format('Y-m-d H:i:s')]);
            fputcsv($file, ['Cashier', $order->user->name ?? 'N/A']);
            fputcsv($file, ['Customer', $order->customer->name ?? 'Walk-in']);
            fputcsv($file, ['Status', ucfirst($order->status)]);
            fputcsv($file, ['Subtotal', '$' . number_format($order->subtotal, 2)]);
            fputcsv($file, ['Discount', '$' . number_format($order->discount_amount, 2)]);
            fputcsv($file, ['Total', '$' . number_format($order->total, 2)]);
            fputcsv($file, []);

            // Payments Section
            fputcsv($file, ['Payments']);
            fputcsv($file, ['Method', 'Amount', 'Change', 'Reference', 'Paid At']);
            foreach ($order->payments as $payment) {
                fputcsv($file, [
                    ucfirst($payment->method),
                    '$' . number_format($payment->amount, 2),
                    '$' . number_format($payment->change, 2),
                    $payment->reference ?? 'N/A',
                    $payment->paid_at ? $payment->paid_at->format('Y-m-d H:i:s') : 'N/A'
                ]);
            }
            fputcsv($file, []);

            // Items Section
            fputcsv($file, ['Order Items']);
            fputcsv($file, ['Item', 'SKU', 'Quantity', 'Price', 'Discount', 'Subtotal']);

            foreach ($order->items as $item) {
                fputcsv($file, [
                    $item->product_name,
                    $item->product_sku,
                    $item->quantity,
                    '$' . number_format($item->price, 2),
                    $item->discount . '%',
                    '$' . number_format($item->subtotal, 2)
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
