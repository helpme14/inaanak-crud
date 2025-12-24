<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Ninong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

use App\Notifications\NinongVerifyCode;

class NinongAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:ninongs',
            'password' => 'required|string|min:8|confirmed',
        ]);

        DB::beginTransaction();
        try {
            $ninong = Ninong::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $ninong->createToken('ninong-token', ['ninong'])->plainTextToken;

            // Generate verification code and send via email
            $code = (string) random_int(100000, 999999);
            $ninong->forceFill([
                'verification_code' => Hash::make($code),
                'verification_code_expires_at' => now()->addMinutes(10),
            ])->save();
            $ninong->notify(new NinongVerifyCode($code));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ninong registered successfully. Please verify your email.',
                'data' => [
                    'ninong' => $ninong,
                    'token' => $token,
                    'must_verify_email' => is_null($ninong->email_verified_at),
                ]
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::warning('Failed to register ninong', [
                'email' => $validated['email'],
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
        ]);

        $user = Ninong::where('email', $validated['email'])->first();
        if ($user && Hash::check($validated['password'], $user->password)) {
            $token = $user->createToken('ninong-token', ['ninong'])->plainTextToken;
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'ninong' => $user,
                    'token' => $token,
                    'must_verify_email' => is_null($user->email_verified_at),
                ]
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ], 200);
    }

    public function logout(Request $request)
    {
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            optional($request->user()->currentAccessToken())->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ], 200);
    }
}