<?php

namespace App\Http\Requests\API;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Any authenticated user can update their own profile
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:255',
            'password' => 'nullable|string|min:8|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];
    }
}
