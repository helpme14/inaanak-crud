<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\Request;

class CheckStatusController extends Controller
{
    /**
     * Check registration status by reference number (Public)
     */
    public function checkStatus(Request $request, $referenceNumber)
    {
        $email = $request->query('email');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'message' => 'A valid email is required',
            ], 422);
        }

        $registration = Registration::with('guardian')
            ->where('reference_number', $referenceNumber)
            ->first();

        if (!$registration || strtolower($registration->guardian->email) !== strtolower($email)) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'reference_number' => $registration->reference_number,
                'inaanak_name' => $registration->inaanak_name,
                'status' => $registration->status,
                'created_at' => $registration->created_at,
                'updated_at' => $registration->updated_at,
                'guardian_email' => $registration->guardian->email,
                'rejection_reason' => $registration->rejection_reason,
            ]
        ], 200);
    }
}