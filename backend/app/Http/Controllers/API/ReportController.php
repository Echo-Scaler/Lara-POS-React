<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    use ApiResponse;

    public function dashboard(Request $request)
    {
        $today = Carbon::today();

        // 1. Total Sales Today
        $salesToday = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        // 2. Total Orders Today
        $ordersToday = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->count();

        // 3. Low Stock Alerts
        $lowStockProducts = Product::whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_active', true)
            ->with('category')
            ->get();

        // 4. Top Selling Products (Last 30 Days)
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select('products.name', 'products.image', DB::raw('SUM(order_items.quantity) as total_sold'), DB::raw('SUM(order_items.subtotal) as total_revenue'))
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        // Format image URLs
        foreach ($topProducts as $tp) {
            $tp->image_url = $tp->image ? url(Storage::url($tp->image)) : null;
            unset($tp->image);
        }

        return $this->successResponse([
            'sales_today' => $salesToday,
            'orders_today' => $ordersToday,
            'low_stock_products' => $lowStockProducts,
            'top_products' => $topProducts,
        ]);
    }

    public function salesChart(Request $request)
    {
        // Last 7 days sales
        $days = 7;
        $sales = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Order::whereDate('created_at', $date)
                ->where('status', 'completed')
                ->sum('total');

            $sales[] = [
                'date' => $date->format('M d'),
                'total' => $total
            ];
        }

        return $this->successResponse($sales);
    }
}
