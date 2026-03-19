<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'manager']);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:categories,slug,' . $this->route('category')->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
