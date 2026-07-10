<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
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
}
