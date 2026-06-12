<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('company'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh()->load('company'));
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $path = $request->file('photo')->store("avatars", 'public');
        $user->update(['photo' => $path]);

        return response()->json([
            'photo'     => $path,
            'photo_url' => Storage::disk('public')->url($path),
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
