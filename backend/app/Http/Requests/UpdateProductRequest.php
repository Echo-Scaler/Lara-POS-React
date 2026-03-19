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

        return [
            'name' => 'sometimes|string|max:255',
            'sku' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('products')->ignore($this->route('product'))],
            'barcode' => ['nullable', 'string', 'max:255', \Illuminate\Validation\Rule::unique('products')->ignore($this->route('product'))],
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|numeric|min:0',
            'discount' => 'numeric|min:0|max:100',
            'stock' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'image.file' => 'DEBUG EDIT: Field must be a file',
            'image.image' => 'DEBUG EDIT: Field must be an image',
            'image.mimes' => 'DEBUG EDIT: Allowed: jpeg, png, jpg, gif, webp',
        ];
    }
}
