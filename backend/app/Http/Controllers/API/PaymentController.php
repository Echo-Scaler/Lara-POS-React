<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Http\Resources\PaymentResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $payments = Payment::with('order')->latest('paid_at')->paginate($request->get('per_page', 20));

        return $this->successResponse($payments);
    }

    public function show(Payment $payment)
    {
        $payment->load('order');
        return $this->successResponse(new PaymentResource($payment));
    }
}
