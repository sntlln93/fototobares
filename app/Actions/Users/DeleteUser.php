<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteUser implements ActionContract
{
    /**
     * Delete a user, detaching its roles first. The caller guards against
     * self-deletion and users in charge of a school.
     *
     * @param  array<string, mixed>  $params  {user: User}
     */
    public function handle(array $params): void
    {
        /** @var User $user */
        $user = $params['user'];

        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $user->delete();
        });
    }
}
