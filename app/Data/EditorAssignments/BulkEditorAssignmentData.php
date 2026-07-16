<?php

declare(strict_types=1);

namespace App\Data\EditorAssignments;

use App\Contracts\DtoContract;

final readonly class BulkEditorAssignmentData implements DtoContract
{
    /**
     * @param  array<int, int>  $productIds
     */
    public function __construct(
        public int $editorId,
        public int $assignedBy,
        public ?int $schoolId,
        public ?int $classroomId,
        public array $productIds,
    ) {}
}
