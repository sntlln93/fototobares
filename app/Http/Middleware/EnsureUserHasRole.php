<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * Usage: ->middleware('role:master,administración')
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        $allowed = array_values(array_filter(array_map(
            fn (string $role) => UserRole::tryFrom($role),
            $roles,
        )));

        if (! $user->hasAnyRole(...$allowed)) {
            abort(403, 'No tenés permisos para acceder a esta sección.');
        }

        return $next($request);
    }
}
