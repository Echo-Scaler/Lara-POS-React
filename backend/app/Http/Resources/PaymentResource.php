<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'amount'   => $this->amount,
            'change'   => $this->change,
            'method'   => $this->method,
            'reference'=> $this->reference,
            'paid_at'  => $this->paid_at,
            'order_id' => $this->order_id,
            'order_no' => $this->order?->order_no,
        ];
    }
}
