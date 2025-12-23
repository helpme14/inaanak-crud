<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\GuardianAuthController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\CheckStatusController;

// Guardian Authentication Routes (Public)
Route::post('/guardian/register', [GuardianAuthController::class, 'register']);
Route::post('/guardian/login', [GuardianAuthController::class, 'login']);

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
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/register', [AdminAuthController::class, 'register']); // For setup only

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