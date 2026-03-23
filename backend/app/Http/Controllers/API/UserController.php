<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    use ApiResponse, HandlesImageUpload;

    public function index(Request $request)
    {
        // Authorization is handled by the StoreUserRequest/UpdateUserRequest FormRequests
        // for mutations. For index, we rely on route-level middleware or a simple check.
        abort_unless($request->user()->hasRole(['admin', 'manager']), 403, 'Unauthorized');

        $query = User::latest('id');

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->get('role'));
        }

        $users = $query->paginate($request->get('per_page', 9));

        return $this->successResponse(UserResource::collection($users), 'Users retrieved successfully');
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $this->uploadImage($request->file('avatar'), 'avatars');
        }

        $user = User::create($data);

        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']);
        }

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $this->replaceImage($request->file('avatar'), $user->avatar, 'avatars');
        }

        $user->update($data);

        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return $this->errorResponse('You cannot delete your own account', 422);
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        return $this->successResponse(null, 'User deleted successfully');
    }
}
