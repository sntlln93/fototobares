<?php

declare(strict_types=1);

namespace App\Actions\EditorAssignments;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditorAssignments\EditorUnassignmentData;
use App\Models\EditorOrderDetailAssignment;

/**
 * @implements ActionContract<EditorUnassignmentData>
 */
class UnassignEditorAction implements ActionContract
{
    /**
     * Remove the editor assignment of an order detail. Idempotent: no
     * error if the detail has no assignment.
     *
     * @param  EditorUnassignmentData  $params
     */
    public function handle(DtoContract $params): void
    {
        EditorOrderDetailAssignment::where('order_detail_id', $params->orderDetailId)->delete();
    }
}
