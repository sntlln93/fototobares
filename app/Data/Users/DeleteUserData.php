<?php

declare(strict_types=1);

namespace App\Data\Users;

use App\Contracts\DtoContract;
use App\Models\User;

final readonly class DeleteUserData implements DtoContract
{
    public function __construct(
        public User $user,
    ) {}
}
