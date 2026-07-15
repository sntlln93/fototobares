<?php

declare(strict_types=1);

namespace App\Data\Users;

use App\Contracts\DtoContract;
use App\Models\User;

final readonly class UserUpdateData implements DtoContract
{
    /**
     * @param  list<int>  $roles
     */
    public function __construct(
        public User $user,
        public string $name,
        public string $email,
        public ?string $password,
        public array $roles,
    ) {}
}
