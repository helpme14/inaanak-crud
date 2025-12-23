<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NinongInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NinongInviteController extends Controller
{
    public function index(Request $request)
    {
        $invites = $request->user()->invites()->latest()->get();
        return response()->json(['success' => true, 'data' => $invites]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usage_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        $code = strtoupper(Str::random(8));
        $invite = $request->user()->invites()->create([
            'code' => $code,
            'usage_limit' => $validated['usage_limit'] ?? 1,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return response()->json(['success' => true, 'data' => $invite], 201);
    }
}
