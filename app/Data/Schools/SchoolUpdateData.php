<?php

declare(strict_types=1);

namespace App\Data\Schools;

use App\Contracts\DtoContract;
use App\Models\School;

final readonly class SchoolUpdateData implements DtoContract
{
    public function __construct(
        public School $school,
        public SchoolData $data,
    ) {}
}
