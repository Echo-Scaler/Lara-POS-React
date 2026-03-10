<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cashiers can create orders
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,id',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:cash,card,qr',
            'amount_paid' => 'required|numeric|min:0',
            'reference' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0', // Current price at time of sale
            'items.*.discount' => 'numeric|min:0|max:100',
        ];
    }
}
