<?php

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\GuardianAuthController;
use App\Http\Controllers\Auth\NinongAuthController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\CheckStatusController;
use App\Http\Controllers\Api\NinongInviteController;

// Guardian Authentication Routes (Public)
// Throttle public auth endpoints to mitigate brute-force and abuse
Route::post('/guardian/register', [GuardianAuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/guardian/login', [GuardianAuthController::class, 'login'])->middleware('throttle:10,1');

// Ninong Authentication Routes (Public)
// Add throttling to public auth endpoints to reduce brute-force / abuse
Route::post('/ninong/register', [NinongAuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/ninong/login', [NinongAuthController::class, 'login'])->middleware('throttle:10,1');

// Ninong Email Verification Routes
Route::get('/ninong/verify-email/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    $frontend = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect($frontend . '/ninong/verified?status=success');
})->middleware(['signed', 'throttle:6,1'])->name('ninong.verification.verify');

// Resend verification (code + link) - requires auth but not verified yet
Route::middleware(['auth:sanctum','ninong','throttle:1,1'])->post('/ninong/email/verification-notification', function (Request $request) {
    $user = $request->user();
    if ($user && method_exists($user, 'hasVerifiedEmail') && !$user->hasVerifiedEmail()) {
        // Generate and send code
        try {
            $code = (string) random_int(100000, 999999);
            $user->forceFill([
                'verification_code' => \Illuminate\Support\Facades\Hash::make($code),
                'verification_code_expires_at' => now()->addMinutes(10),
            ])->save();
            $user->notify(new \App\Notifications\NinongVerifyCode($code));
        } catch (\Throwable $e) {}

        // (No longer send link-based verification)
    }
    return response()->json(['success' => true, 'message' => 'Verification link sent if not yet verified.']);
});

// Verify by code (requires auth)
Route::middleware(['auth:sanctum','ninong'])->post('/ninong/verify-code', function (Request $request) {
    $validated = $request->validate([
        'code' => 'required|digits:6',
    ]);
    $user = $request->user();
    if (!$user || ($user->hasVerifiedEmail())) {
        return response()->json(['success' => false, 'message' => 'Already verified or unauthorized'], 400);
    }
    if (!$user->verification_code || !$user->verification_code_expires_at || now()->gt($user->verification_code_expires_at)) {
        return response()->json([
            'success' => false,
            'message' => 'Verification code expired. Please request a new code.'
        ], 422);
    }
    if (!\Illuminate\Support\Facades\Hash::check($validated['code'], $user->verification_code)) {
        return response()->json(['success' => false, 'message' => 'Invalid verification code.'], 422);
    }
    $user->forceFill([
        'email_verified_at' => now(),
        'verification_code' => null,
        'verification_code_expires_at' => null,
    ])->save();
    return response()->json(['success' => true, 'message' => 'Email verified successfully.']);
});

// Public Registration Routes (No auth required)
Route::post('/registrations', [RegistrationController::class, 'store']);
Route::get('/registrations/check-status/{referenceNumber}', [CheckStatusController::class, 'checkStatus']);

// Guardian Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/guardian/logout', [GuardianAuthController::class, 'logout']);
    Route::get('/guardian/profile', [GuardianAuthController::class, 'profile']);
    
    // Guardian can view and download their own registrations
    Route::get('/registrations/my', [RegistrationController::class, 'myRegistrations']);
    Route::get('/registrations/{id}', [RegistrationController::class, 'show']);
    Route::get('/registrations/{id}/download/{fileType}', [RegistrationController::class, 'downloadFile']);
});

// Admin Authentication Routes
// Apply throttling to admin auth endpoints to reduce brute-force attacks
Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/admin/register', [AdminAuthController::class, 'register'])->middleware('throttle:5,1'); // For setup only

// Admin Protected Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/profile', [AdminAuthController::class, 'profile']);
    
    // Admin Registration Management
    Route::get('/admin/registrations', [RegistrationController::class, 'index']);
    Route::get('/admin/registrations/{id}', [RegistrationController::class, 'show']);
    Route::get('/admin/registrations/{id}/download/{fileType}', [RegistrationController::class, 'downloadFile']);
    Route::put('/admin/registrations/{id}/status', [RegistrationController::class, 'updateStatus']);
});

// Ninong Authenticated (unverified allowed) Routes
Route::middleware(['auth:sanctum','ninong'])->group(function () {
    Route::post('/ninong/logout', [NinongAuthController::class, 'logout']);
    Route::get('/ninong/profile', [NinongAuthController::class, 'profile']);
});

// Ninong Verified Routes
Route::middleware(['auth:sanctum','ninong','verified'])->group(function () {
    // Invite management
    Route::get('/ninong/invites', [NinongInviteController::class, 'index']);
    Route::post('/ninong/invites', [NinongInviteController::class, 'store']);

    // Ninong can see their own registrations
    Route::get('/ninong/registrations', function (Request $request) {
        $user = $request->user();
        if (!$user || !method_exists($user, 'registrations')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        return response()->json(['success' => true, 'data' => $user->registrations()->with('guardian')->latest()->get()]);
    });
});