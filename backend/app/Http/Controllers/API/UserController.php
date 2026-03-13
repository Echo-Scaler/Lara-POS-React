<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        // Role check remains for index since it doesn't use a FormRequest for data fetching
        if (!$request->user()->hasRole(['admin', 'manager'])) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $users = User::latest('id')->paginate($request->get('per_page', 15));
        
        return $this->successResponse(UserResource::collection($users), 'Users retrieved successfully');
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function destroy(User $user, Request $request)
    {
        if (!$request->user()->hasRole(['admin', 'manager'])) {
            return $this->errorResponse('Unauthorized', 403);
        }

        if ($user->id === $request->user()->id) {
            return $this->errorResponse('Cannot delete yourself', 422);
        }

        $user->delete();
        return $this->successResponse(null, 'User deleted successfully');
    }
}
