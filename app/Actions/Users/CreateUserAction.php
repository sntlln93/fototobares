<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Users\UserCreationData;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @implements ActionContract<UserCreationData>
 */
class CreateUserAction implements ActionContract
{
    /**
     * Create a user with a hashed password and sync its roles.
     *
     * @param  UserCreationData  $params
     */
    public function handle(DtoContract $params): void
    {
        DB::transaction(function () use ($params) {
            $user = User::create([
                'name' => $params->name,
                'email' => $params->email,
                'password' => Hash::make($params->password),
            ]);

            $user->roles()->sync($params->roles);
        });
    }
}
