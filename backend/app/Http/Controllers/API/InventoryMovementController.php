<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Http\Resources\InventoryMovementResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class InventoryMovementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product', 'user']); // Eager loading for N+1 prevention

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $movements = $query->latest('id')->paginate($request->get('per_page', 20));

        return InventoryMovementResource::collection($movements)->additional([
            'success' => true
        ]);
    }
}
