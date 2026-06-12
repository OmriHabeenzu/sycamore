<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    private function adminOnly(Request $request): void
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Admin access required.');
        }
    }

    public function index(Request $request)
    {
        $this->adminOnly($request);

        $staff = User::where('company_id', $request->user()->company_id)
            ->whereIn('role', ['admin', 'staff', 'loan_officer'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'role', 'is_active', 'permissions', 'created_at']);

        return response()->json(['data' => $staff]);
    }

    public function store(Request $request)
    {
        $this->adminOnly($request);

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'email'       => 'required|email|unique:users,email',
            'phone'       => 'nullable|string|max:20',
            'role'        => 'required|in:admin,staff,manager,loan_officer,cashier',
            'permissions' => 'nullable|array',
        ]);

        $password = strtoupper(Str::random(4)) . rand(100, 999);

        $user = User::create([
            'company_id'  => $request->user()->company_id,
            'name'        => $data['name'],
            'email'       => $data['email'],
            'phone'       => $data['phone'] ?? null,
            'role'        => $data['role'],
            'permissions' => $data['permissions'] ?? null,
            'password'    => Hash::make($password),
            'is_active'   => true,
        ]);

        return response()->json([
            'user'               => $user,
            'generated_password' => $password,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $this->adminOnly($request);

        if ($user->company_id !== $request->user()->company_id) {
            abort(403);
        }

        $data = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'phone'       => 'nullable|string|max:20',
            'role'        => 'sometimes|in:admin,staff',
            'is_active'   => 'sometimes|boolean',
            'permissions' => 'nullable|array',
        ]);

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        $this->adminOnly($request);

        if ($user->company_id !== $request->user()->company_id) {
            abort(403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Staff account removed.']);
    }
}
