<?php

declare(strict_types=1);

namespace App\Actions\EditorAssignments;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditorAssignments\EditorUnassignmentData;
use App\Enums\EditingStatus;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;
use Illuminate\Validation\ValidationException;

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
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $detail = OrderDetail::findOrFail($params->orderDetailId);

        if ($detail->currentEditingStatus() !== EditingStatus::Pendiente) {
            throw ValidationException::withMessages([
                'order_detail_id' => 'Esta foto ya está editada y no se puede desasignar.',
            ]);
        }

        EditorOrderDetailAssignment::where('order_detail_id', $params->orderDetailId)->delete();
    }
}
