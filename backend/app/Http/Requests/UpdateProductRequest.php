<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'manager']);
    }

    public function rules(): array
    {
        $id = $this->route('product')->id;

        return [
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|string|max:255|unique:products,sku,' . $id,
            'barcode' => 'nullable|string|max:255|unique:products,barcode,' . $id,
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'discount' => 'numeric|min:0|max:100',
            'stock' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
