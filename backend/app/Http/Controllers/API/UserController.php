<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        // Only admin/manager can view users
        if (! $request->user()->hasRole(['admin', 'manager'])) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $users = User::latest('id')->paginate($request->get('per_page', 15));
        return $this->successResponse($users);
    }

    public function store(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized. Only Admins can create users', 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'manager', 'cashier'])],
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return $this->successResponse($user, 'User created successfully', 201);
    }

    public function update(Request $request, User $user)
    {
        if (! $request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', Rule::in(['admin', 'manager', 'cashier'])],
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $this->successResponse($user, 'User updated successfully');
    }

    public function destroy(User $user, Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if ($user->id === $request->user()->id) {
            return $this->errorResponse('Cannot delete yourself', 422);
        }

        $user->delete();
        return $this->successResponse(null, 'User deleted successfully');
    }
}
