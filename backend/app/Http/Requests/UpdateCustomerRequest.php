<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer')->id;
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone,' . $customerId,
            'email' => 'nullable|email|max:255|unique:customers,email,' . $customerId,
            'address' => 'nullable|string',
        ];
    }
}
