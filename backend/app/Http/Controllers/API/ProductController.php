<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Product::with('category'); // N+1 prevention

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Pagination setup
        $perPage = $request->get('per_page', 15);
        $products = $query->latest()->paginate($perPage);

        return ProductResource::collection($products)->additional([
            'success' => true,
            'message' => 'Products retrieved successfully'
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->handleImageUpload($request->file('image'));
        }

        $product = Product::create($data);
        $product->load('category');

        return $this->successResponse(new ProductResource($product), 'Product created successfully', 201);
    }

    public function show(Product $product)
    {
        $product->load('category');
        return $this->successResponse(new ProductResource($product));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $this->handleImageUpload($request->file('image'));
        }

        $product->update($data);
        $product->load('category');

        return $this->successResponse(new ProductResource($product), 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            return $this->errorResponse('Cannot delete product attached to orders', 422);
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return $this->successResponse(null, 'Product deleted successfully');
    }

    /**
     * Handle Image Upload natively
     */
    private function handleImageUpload($file)
    {
        $filename = 'products/' . Str::random(40) . '.' . $file->getClientOriginalExtension();

        // Save to public storage natively
        Storage::disk('public')->put($filename, file_get_contents($file));

        return $filename;
    }
}
