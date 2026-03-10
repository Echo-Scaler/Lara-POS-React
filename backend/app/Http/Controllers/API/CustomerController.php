<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Resources\CustomerResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $customers = Customer::latest('id')->paginate($request->get('per_page', 15));
        return CustomerResource::collection($customers)->additional([
            'success' => true
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers',
            'email' => 'nullable|email|max:255|unique:customers',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($data);

        return $this->successResponse((new CustomerResource($customer))->resolve(), 'Customer created successfully', 201);
    }

    public function show(Customer $customer)
    {
        $customer->load('orders');
        return $this->successResponse((new CustomerResource($customer))->resolve());
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone,' . $customer->id,
            'email' => 'nullable|email|max:255|unique:customers,email,' . $customer->id,
            'address' => 'nullable|string',
        ]);

        $customer->update($data);

        return $this->successResponse((new CustomerResource($customer))->resolve(), 'Customer updated successfully');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->orders()->exists()) {
            return $this->errorResponse('Cannot delete customer with past orders', 422);
        }

        $customer->delete();
        return $this->successResponse(null, 'Customer deleted successfully');
    }
}
