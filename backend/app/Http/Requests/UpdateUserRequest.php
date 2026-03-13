<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'manager']);
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $userId,
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', Rule::in(['admin', 'manager', 'cashier'])],
        ];
    }
}
