<?php

declare(strict_types=1);

namespace App\Data\EditorAssignments;

use App\Contracts\DtoContract;

final readonly class EditorAssignmentData implements DtoContract
{
    public function __construct(
        public int $orderDetailId,
        public int $editorId,
        public int $assignedBy,
    ) {}
}
