<?php

declare(strict_types=1);

namespace App\Actions\EditorAssignments;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditorAssignments\EditorAssignmentData;
use App\Enums\EditingStatus;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<EditorAssignmentData>
 */
class AssignEditorAction implements ActionContract
{
    /**
     * Assign (or reassign) an editor to an order detail. The detail's
     * product must be editable by photo (`has_photo`); reassigning
     * overwrites the previous assignment (unique per detail, no history).
     *
     * @param  EditorAssignmentData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $detail = OrderDetail::with('product')->findOrFail($params->orderDetailId);

        if ($detail->product?->has_photo !== true) {
            throw ValidationException::withMessages([
                'order_detail_id' => 'Este producto no admite edición de foto.',
            ]);
        }

        if ($detail->currentEditingStatus() !== EditingStatus::Pendiente) {
            throw ValidationException::withMessages([
                'order_detail_id' => 'Esta foto ya está editada y no se puede reasignar.',
            ]);
        }

        EditorOrderDetailAssignment::updateOrCreate(
            ['order_detail_id' => $params->orderDetailId],
            [
                'editor_id' => $params->editorId,
                'assigned_by' => $params->assignedBy,
                'assigned_at' => now(),
            ]
        );
    }
}
