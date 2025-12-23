<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow if session-authenticated via admin guard
        if (Auth::guard('admin')->check()) {
            return $next($request);
        }

        // Allow if Sanctum token-authenticated as Admin model
        $user = $request->user();
        if ($user instanceof Admin) {
            return $next($request);
        }

        // Allow if token has explicit 'admin' ability
        if ($user && method_exists($user, 'tokenCan') && $user->tokenCan('admin')) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Admin access required'
        ], 403);
    }
}