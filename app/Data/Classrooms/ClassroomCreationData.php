<?php

declare(strict_types=1);

namespace App\Data\Classrooms;

use App\Contracts\DtoContract;

final readonly class ClassroomCreationData implements DtoContract
{
    public function __construct(
        public string $name,
        public int $schoolId,
        public ?string $teacher,
        public int|string|null $phone,
    ) {}
}
