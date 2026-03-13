<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\InventoryMovementController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin & Manager Only
    Route::apiResource('users', UserController::class)->except(['show']);

    // POS Core
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{order}/csv', [OrderController::class, 'exportCsv']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // Inventory
    Route::get('/inventory', [InventoryMovementController::class, 'index']);

    // Reports
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/sales-chart', [ReportController::class, 'salesChart']);
});
