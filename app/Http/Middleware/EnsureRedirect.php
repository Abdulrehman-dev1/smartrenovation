<?php

namespace App\Http\Middleware;

use App\Models\Redirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRedirect
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = '/'.ltrim($request->getPathInfo(), '/');
        if ($path !== '/') {
            $path = rtrim($path, '/') ?: '/';
        }

        $redirect = Redirect::query()
            ->where('is_active', true)
            ->where(function ($query) use ($path, $request) {
                $query->where('from_path', $path)
                    ->orWhere('from_path', $request->getPathInfo())
                    ->orWhere('from_path', ltrim($path, '/'));
            })
            ->first();

        if ($redirect) {
            $status = in_array((int) $redirect->status_code, [301, 302, 307, 308], true)
                ? (int) $redirect->status_code
                : 301;

            $to = $redirect->to_path;
            if (! str_starts_with($to, 'http://') && ! str_starts_with($to, 'https://')) {
                $to = url('/'.ltrim($to, '/'));
            }

            return redirect()->to($to, $status);
        }

        return $next($request);
    }
}
