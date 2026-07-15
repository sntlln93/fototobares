<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

final readonly class AllocatePhotoNumberData implements DtoContract
{
    public function __construct(
        public int $classroomId,
    ) {}
}
