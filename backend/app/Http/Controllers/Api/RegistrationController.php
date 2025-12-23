<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Guardian;
use App\Models\Registration;
use App\Models\NinongInvite;
use App\Notifications\RegistrationSubmitted;
use App\Notifications\RegistrationStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RegistrationController extends Controller
{
    /**
     * Get all registrations (Admin only)
     */
    public function index()
    {
        $registrations = Registration::with('guardian')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $registrations
        ], 200);
    }

    /**
     * Get registration by ID (Admin or Guardian)
     */
    public function show(Request $request, $id)
    {
        $registration = Registration::with('guardian')->findOrFail($id);

        // Get the authenticated user from Sanctum
        $user = $request->user();

        // Check if user is Admin (has admin ability or is Admin model)
        $isAdmin = $user && (
            $user instanceof Admin || 
            ($user->tokenCan('admin'))
        );

        // Check if user is the guardian owner
        $isGuardianOwner = $user && $user instanceof Guardian && $registration->guardian_id === $user->id;

        // Check if user is the associated Ninong
        $isNinongOwner = $user && method_exists($user, 'getKey') && $registration->ninong_id === $user->getKey();

        if (!$isAdmin && !$isGuardianOwner && !$isNinongOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $registration
        ], 200);
    }

    /**
     * Create new registration
     */
    public function store(Request $request)
    {
        // First validate guardian data and basic file presence
        $validated = $request->validate([
            // Guardian data
            'guardian_name' => 'required|string|max:255',
            'guardian_email' => 'required|email|max:255',
            'guardian_contact' => 'required|string|max:20',
            'guardian_address' => 'required|string',
            // Inaanak data
            'inaanak_name' => 'required|string|max:255',
            'inaanak_birthdate' => 'required|date',
            'relationship' => 'required|string|max:255',
            // Ninong code (required)
            'ninong_code' => 'required|string|max:50',
            // Files - Just check they exist and are under size limit
            'live_photo' => 'nullable|file|max:10240',
            'video' => 'nullable|file|max:102400',
            'qr_code' => 'nullable|file|max:10240',
        ]);

        // Additional file type validation with better error handling
        $fileErrors = [];
        
        if ($request->hasFile('live_photo')) {
            $file = $request->file('live_photo');
            $validImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/x-heic', 'image/x-heif'];
            if (!in_array($file->getMimeType(), $validImageMimes) && !in_array($file->getClientMimeType(), $validImageMimes)) {
                $fileErrors['live_photo'] = ['File must be an image (JPEG, PNG, GIF, WebP, HEIC)'];
            }
        }
        
        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $validVideoMimes = ['video/mp4', 'video/quicktime', 'video/x-quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'];
            if (!in_array($file->getMimeType(), $validVideoMimes) && !in_array($file->getClientMimeType(), $validVideoMimes)) {
                $fileErrors['video'] = ['File must be a video (MP4, MOV, AVI, WMV, WebM)'];
            }
        }
        
        if ($request->hasFile('qr_code')) {
            $file = $request->file('qr_code');
            $validImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/x-heic', 'image/x-heif'];
            if (!in_array($file->getMimeType(), $validImageMimes) && !in_array($file->getClientMimeType(), $validImageMimes)) {
                $fileErrors['qr_code'] = ['File must be an image (JPEG, PNG, GIF, WebP, HEIC)'];
            }
        }
        
        if (!empty($fileErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'File validation failed',
                'errors' => $fileErrors
            ], 422);
        }

        // Find or create guardian
        $guardian = Guardian::firstOrCreate(
            ['email' => $validated['guardian_email']],
            [
                'name' => $validated['guardian_name'],
                'contact_number' => $validated['guardian_contact'],
                'address' => $validated['guardian_address'],
                'password' => bcrypt('default_password_' . uniqid()), // Temporary password
            ]
        );

        // Handle file uploads (stored in private storage)
        $livePhotoPath = null;
        $videoPath = null;
        $qrCodePath = null;

        if ($request->hasFile('live_photo')) {
            $livePhotoPath = $request->file('live_photo')->store('registrations/photos', 'local');
        }

        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('registrations/videos', 'local');
        }

        if ($request->hasFile('qr_code')) {
            $qrCodePath = $request->file('qr_code')->store('registrations/qr_codes', 'local');
        }

        // Validate and associate Ninong via invite code
        $invite = NinongInvite::where('code', $validated['ninong_code'])->first();
        if (!$invite) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Ninong code.',
                'errors' => ['ninong_code' => ['The provided code is invalid.']]
            ], 422);
        }
        if (($invite->usage_limit !== null && $invite->used_count >= $invite->usage_limit) || ($invite->expires_at && now()->gte($invite->expires_at))) {
            return response()->json([
                'success' => false,
                'message' => 'Ninong code is no longer valid.',
                'errors' => ['ninong_code' => ['The provided code has expired or reached its usage limit.']]
            ], 422);
        }
        $ninongId = $invite->ninong_id;
        $invite->increment('used_count');

        $registration = Registration::create([
            'reference_number' => Registration::generateReferenceNumber(),
            'guardian_id' => $guardian->id,
            'ninong_id' => $ninongId,
            'inaanak_name' => $validated['inaanak_name'],
            'inaanak_birthdate' => $validated['inaanak_birthdate'],
            'relationship' => $validated['relationship'],
            'live_photo_path' => $livePhotoPath,
            'video_path' => $videoPath,
            'qr_code_path' => $qrCodePath,
        ]);

        // Send confirmation email
        Notification::send($guardian, new RegistrationSubmitted($registration));

        return response()->json([
            'success' => true,
            'message' => 'Registration submitted successfully',
            'data' => $registration
        ], 201);
    }

    /**
     * Update registration status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $registration = Registration::with('guardian')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,released,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $registration->update($validated);

        // Notify guardian about the status update
        if ($registration->guardian) {
            Notification::send($registration->guardian, new RegistrationStatusUpdated($registration));
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration updated successfully',
            'data' => $registration
        ], 200);
    }

    /**
     * Get Guardian's registrations
     */
    public function myRegistrations()
    {
        $guardian = Auth::guard('guardian')->user();
        $registrations = Registration::where('guardian_id', $guardian->id)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $registrations
        ], 200);
    }

    /**
     * Download registration file (authenticated)
     */
    public function downloadFile(Request $request, $registrationId, $fileType)
    {
        $registration = Registration::findOrFail($registrationId);

        // Get the authenticated user from Sanctum
        $user = $request->user();
        
        // Check if user is Admin
        $isAdmin = $user && (
            $user instanceof Admin || 
            ($user->tokenCan('admin'))
        );
        
        // Check if user is the guardian owner
        $isGuardianOwner = $user && $user instanceof Guardian && $registration->guardian_id === $user->id;

        // Check if user is the associated Ninong
        $isNinongOwner = $user && method_exists($user, 'getKey') && $registration->ninong_id === $user->getKey();

        if (!$isAdmin && !$isGuardianOwner && !$isNinongOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Determine file path based on type
        $filePath = null;
        $filename = null;

        switch ($fileType) {
            case 'live_photo':
                $filePath = $registration->live_photo_path;
                $filename = "live-photo-{$registration->reference_number}.jpg";
                break;
            case 'video':
                $filePath = $registration->video_path;
                $filename = "video-{$registration->reference_number}.mp4";
                break;
            case 'qr_code':
                $filePath = $registration->qr_code_path;
                $filename = "qr-code-{$registration->reference_number}.jpg";
                break;
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file type'
                ], 400);
        }

        // Check if file exists
        if (!$filePath || !Storage::disk('local')->exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        // Stream the file
        return Storage::disk('local')->download($filePath, $filename);
    }
}