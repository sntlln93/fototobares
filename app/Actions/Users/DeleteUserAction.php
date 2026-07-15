<?php

declare(strict_types=1);

namespace App\Actions\Users;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Users\UserDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<UserDeletionData>
 */
class DeleteUserAction implements ActionContract
{
    /**
     * Delete a user, detaching its roles first. The caller guards against
     * self-deletion and users in charge of a school.
     *
     * @param  UserDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $user = $params->user;

        DB::transaction(function () use ($user) {
            $user->roles()->detach();
            $user->delete();
        });
    }
}
