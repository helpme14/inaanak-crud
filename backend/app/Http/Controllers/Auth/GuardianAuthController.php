<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class GuardianAuthController extends Controller
{
    /**
     * Guardian Register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:guardians',
            'password' => 'required|string|min:8|confirmed',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string',
        ]);

        // Sanitize user input to avoid stored XSS
        $safeName = strip_tags(trim($validated['name']));
        $safeEmail = filter_var(trim($validated['email']), FILTER_SANITIZE_EMAIL);
        $safeContact = strip_tags(trim($validated['contact_number']));
        $safeAddress = strip_tags(trim($validated['address']));

        $guardian = Guardian::create([
            'name' => $safeName,
            'email' => $safeEmail,
            'password' => Hash::make($validated['password']),
            'contact_number' => $safeContact,
            'address' => $safeAddress,
        ]);

        // Generate token for immediate login after registration
        // Create Sanctum token with explicit 'guardian' ability
        $token = $guardian->createToken('guardian-token', ['guardian'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'guardian' => $guardian,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Guardian Login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
        ]);

        if (Auth::guard('guardian')->attempt($validated)) {
            $guardian = Auth::guard('guardian')->user();
            // Create Sanctum token with explicit 'guardian' ability
            $token = $guardian->createToken('guardian-token', ['guardian'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'guardian' => $guardian,
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
     * Get Guardian Profile
     */
    public function profile(Request $request)
    {
        // Prefer Sanctum-authenticated user; fallback to session guard
        $user = $request->user() ?? Auth::guard('guardian')->user();
        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    /**
     * Guardian Logout
     */
    public function logout(Request $request)
    {
        // Revoke current Sanctum token if present
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            optional($request->user()->currentAccessToken())->delete();
        }

        // Also logout session guard if used
        Auth::guard('guardian')->logout();
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }
}
