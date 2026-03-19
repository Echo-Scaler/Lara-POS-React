<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'manager']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:products',
            'barcode' => 'nullable|string|max:255|unique:products',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'discount' => 'numeric|min:0|max:100',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'description' => 'nullable|string',
        ];
    }
}
