<?php

declare(strict_types=1);

namespace App\Data\Classrooms;

use App\Contracts\DtoContract;
use App\Models\Classroom;

final readonly class ClassroomDeletionData implements DtoContract
{
    public function __construct(
        public Classroom $classroom,
    ) {}
}
