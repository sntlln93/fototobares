<?php

declare(strict_types=1);

namespace App\Data\EditorAssignments;

use App\Contracts\DtoContract;

final readonly class EditorUnassignmentData implements DtoContract
{
    public function __construct(
        public int $orderDetailId,
    ) {}
}
