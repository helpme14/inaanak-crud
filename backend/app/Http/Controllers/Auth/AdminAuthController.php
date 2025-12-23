<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    /**
     * Admin Login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if (Auth::guard('admin')->attempt($validated)) {
            $admin = Auth::guard('admin')->user();
            // Create Sanctum token with explicit 'admin' ability
            $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'admin' => $admin,
                    'token' => $token,
                ]
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }

    /**
     * Admin Register (for setup only)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = Admin::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin registered successfully',
            'data' => $admin
        ], 201);
    }

    /**
     * Get Admin Profile
     */
    public function profile(Request $request)
    {
        // Prefer Sanctum-authenticated user; fallback to session guard
        $user = $request->user() ?? Auth::guard('admin')->user();
        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    /**
     * Admin Logout
     */
    public function logout(Request $request)
    {
        // Revoke current Sanctum token if present
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            optional($request->user()->currentAccessToken())->delete();
        }

        // Also logout session guard if used
        Auth::guard('admin')->logout();
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }
}
