<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Users\UserUpdateData;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @implements ActionContract<UserUpdateData>
 */
class UpdateUserAction implements ActionContract
{
    /**
     * Update a user's data and roles, replacing the password only when a new
     * one is provided.
     *
     * @param  UserUpdateData  $params
     */
    public function handle(DtoContract $params): void
    {
        $user = $params->user;

        DB::transaction(function () use ($user, $params) {
            $attributes = [
                'name' => $params->name,
                'email' => $params->email,
            ];

            if (! empty($params->password)) {
                $attributes['password'] = Hash::make($params->password);
            }

            $user->update($attributes);

            $user->roles()->sync($params->roles);
        });
    }
}
