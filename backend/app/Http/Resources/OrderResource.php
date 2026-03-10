<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'customer' => $this->whenLoaded('customer'), // basic relationship
            'user' => [ // Cashier details
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'tax' => $this->tax,
            'total' => $this->total,
            'notes' => $this->notes,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at,
        ];
    }
}
