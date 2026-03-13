<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $customers = Customer::latest('id')->paginate($request->get('per_page', 15));
        
        return $this->successResponse(CustomerResource::collection($customers), 'Customers retrieved successfully');
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());

        return $this->successResponse(new CustomerResource($customer), 'Customer created successfully', 201);
    }

    public function show(Customer $customer)
    {
        $customer->load('orders');
        return $this->successResponse(new CustomerResource($customer));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return $this->successResponse(new CustomerResource($customer), 'Customer updated successfully');
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
