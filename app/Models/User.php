<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[Hidden([
    'password',
    'remember_token',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * @return list<string>
     */
    public function roleNames(): array
    {
        $this->loadMissing('roles');

        /** @var list<string> $names */
        $names = $this->roles->pluck('name')->values()->all();

        return $names;
    }

    public function hasAnyRole(UserRole ...$roles): bool
    {
        $names = $this->roleNames();

        foreach ($roles as $role) {
            if (in_array($role->value, $names, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Users that can be assigned as editor of an order detail: the
     * `editor` role, or `administración` (which may assign to others but
     * never to itself).
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeAssignableEditors(Builder $query): Builder
    {
        return $query->whereHas('roles', function ($roles) {
            $roles->whereIn('name', [UserRole::Editor->value, UserRole::Admin->value]);
        });
    }
}
