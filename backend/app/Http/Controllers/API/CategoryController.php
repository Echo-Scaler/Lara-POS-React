<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $perPage = $request->get('per_page', 9);
        $categories = $query->orderBy('name')->paginate($perPage);

        return $this->successResponse(CategoryResource::collection($categories), 'Categories retrieved successfully');
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return $this->successResponse(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function show(Category $category)
    {
        $category->loadCount('products');
        return $this->successResponse(new CategoryResource($category));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return $this->successResponse(new CategoryResource($category), 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return $this->errorResponse('Cannot delete category with attached products', 422);
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
