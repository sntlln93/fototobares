<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateUser implements ActionContract
{
    /**
     * Update a user's data and roles, replacing the password only when a new
     * one is provided.
     *
     * @param  array<string, mixed>  $params  {user: User, data: array<string, mixed>}
     */
    public function handle(array $params): void
    {
        /** @var User $user */
        $user = $params['user'];

        /** @var array<string, mixed> $data */
        $data = $params['data'];

        DB::transaction(function () use ($user, $data) {
            /** @var array<int, int> $roles */
            $roles = $data['roles'];

            $attributes = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (! empty($data['password'])) {
                /** @var string $password */
                $password = $data['password'];
                $attributes['password'] = Hash::make($password);
            }

            $user->update($attributes);

            $user->roles()->sync($roles);
        });
    }
}
