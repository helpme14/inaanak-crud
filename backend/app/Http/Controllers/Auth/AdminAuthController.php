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
            'recaptcha_token' => 'required|string',
        ]);

        // Verify Google reCAPTCHA similar to other auth flows
        $secret = config('services.recaptcha.secret') ?: env('RECAPTCHA_SECRET') ?: getenv('RECAPTCHA_SECRET') ?: ($_ENV['RECAPTCHA_SECRET'] ?? null) ?: ($_SERVER['RECAPTCHA_SECRET'] ?? null);
        if (!$secret) {
            return response()->json([
                'success' => false,
                'message' => 'reCAPTCHA not configured on server.'
            ], 500);
        }

        try {
            $resp = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $validated['recaptcha_token'],
                'remoteip' => $request->ip(),
            ]);

            try {
                $body = $resp->json();
            } catch (\Throwable $e) {
                $body = json_decode((string) $resp->body(), true);
            }

            if (!is_array($body) || !isset($body['success']) || !$body['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'reCAPTCHA verification failed. Please try again.'
                ], 422);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify reCAPTCHA.'
            ], 422);
        }

        // Only use email and password for authentication attempt to avoid accidental SQL queries
        $credentials = [
            'email' => filter_var(trim($validated['email']), FILTER_SANITIZE_EMAIL),
            'password' => $validated['password'],
        ];

        if (Auth::guard('admin')->attempt($credentials)) {
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

        // Sanitize inputs to avoid stored XSS and ensure safe email
        $safeName = strip_tags(trim($validated['name']));
        $safeEmail = filter_var(trim($validated['email']), FILTER_SANITIZE_EMAIL);

        $admin = Admin::create([
            'name' => $safeName,
            'email' => $safeEmail,
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