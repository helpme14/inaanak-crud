<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Ninong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Notifications\NinongVerifyCode;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\Client\Response as HttpResponse;

class NinongAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:ninongs',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        DB::beginTransaction();
        try {
            // Sanitize inputs to avoid stored XSS
            $safeName = strip_tags(trim($validated['name']));
            $safeEmail = filter_var(trim($validated['email']), FILTER_SANITIZE_EMAIL);

            $ninong = Ninong::create([
                'name' => $safeName,
                'email' => $safeEmail,
                'password' => Hash::make($validated['password']),
            ]);

            // Create token for client
            $token = $ninong->createToken('ninong-token', ['ninong'])->plainTextToken;

            // Generate verification code and set expiry
            $code = (string) random_int(100000, 999999);
            $ninong->forceFill([
                'verification_code' => Hash::make($code),
                'verification_code_expires_at' => now()->addMinutes(10),
            ])->save();

            // Send verification code notification
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
                'email' => $validated['email'] ?? null,
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
            'recaptcha_token' => 'required|string',
        ]);

        // Verify Google reCAPTCHA
        // Read the secret from config (works with config caching). Fall back to env lookups.
        $secret = config('services.recaptcha.secret') ?: env('RECAPTCHA_SECRET') ?: getenv('RECAPTCHA_SECRET') ?: ($_ENV['RECAPTCHA_SECRET'] ?? null) ?: ($_SERVER['RECAPTCHA_SECRET'] ?? null);
        if (!$secret) {
            return response()->json([
                'success' => false,
                'message' => 'reCAPTCHA not configured on server.'
            ], 500);
        }

        // log presence for debugging (do not log the actual secret)
        try {
            \Illuminate\Support\Facades\Log::debug('reCAPTCHA secret present: ' . ($secret ? 'yes' : 'no'));
        } catch (\Throwable $__e) {
            // ignore logging errors
        }

        try {
            /** @var HttpResponse $resp */
            $resp = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $validated['recaptcha_token'],
                'remoteip' => $request->ip(),
            ]);

            // Use the Response helper methods (json/body) - typed above for static analyzers
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
            // treat verification failure as error
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify reCAPTCHA.'
            ], 422);
        }

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