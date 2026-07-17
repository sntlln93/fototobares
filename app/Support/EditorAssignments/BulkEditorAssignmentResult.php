<?php

declare(strict_types=1);

namespace App\Support\EditorAssignments;

final readonly class BulkEditorAssignmentResult
{
    public function __construct(
        public int $assigned,
        public int $skipped,
    ) {}
}
