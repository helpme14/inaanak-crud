<?php

namespace App\Http\Middleware;

use App\Models\Ninong;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsNinong
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user instanceof Ninong) {
            return $next($request);
        }
        if ($user && method_exists($user, 'tokenCan') && $user->tokenCan('ninong')) {
            return $next($request);
        }
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Ninong access required'
        ], 403);
    }
}
