<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateUser implements ActionContract
{
    /**
     * Create a user with a hashed password and sync its roles.
     *
     * @param  array<string, mixed>  $params  validated user payload
     */
    public function handle(array $params): void
    {
        DB::transaction(function () use ($params) {
            /** @var string $password */
            $password = $params['password'];

            /** @var array<int, int> $roles */
            $roles = $params['roles'];

            $user = User::create([
                'name' => $params['name'],
                'email' => $params['email'],
                'password' => Hash::make($password),
            ]);

            $user->roles()->sync($roles);
        });
    }
}
