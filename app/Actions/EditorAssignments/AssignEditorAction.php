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
     * Assign (or reassign) an editor to an order detail. The detail must be
     * assignable (`OrderDetail::assignableToEditor`, the same scope used by
     * the bulk path); reassigning overwrites the previous assignment
     * (unique per detail, no history).
     *
     * @param  EditorAssignmentData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $detail = OrderDetail::findOrFail($params->orderDetailId);

        $isAssignable = OrderDetail::query()
            ->assignableToEditor()
            ->whereKey($params->orderDetailId)
            ->exists();

        if (! $isAssignable) {
            throw ValidationException::withMessages([
                'order_detail_id' => 'Esta fila no admite asignación de editor.',
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
