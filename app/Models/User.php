<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Role, $this>
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
