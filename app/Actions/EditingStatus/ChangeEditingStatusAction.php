<?php

declare(strict_types=1);

namespace App\Actions\EditingStatus;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditingStatus\EditingStatusChangeData;
use App\Enums\EditingStatus;
use App\Enums\UserRole;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;
use App\Models\OrderEditingStatusChange;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<EditingStatusChangeData>
 */
class ChangeEditingStatusAction implements ActionContract
{
    /**
     * Append a new editing status entry after validating the transition
     * against the full matrix: role/assignment gating plus the
     * `production_enabled_at` precondition on the first transition.
     *
     * @param  EditingStatusChangeData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $detail = OrderDetail::with('product')->findOrFail($params->orderDetailId);

        if ($detail->product?->has_photo !== true) {
            throw ValidationException::withMessages([
                'status' => 'Este producto no admite edición de foto.',
            ]);
        }

        $current = $detail->currentEditingStatus();

        $actor = User::findOrFail($params->changedById);
        $isManager = $actor->hasAnyRole(UserRole::Admin, UserRole::Office, UserRole::Master);
        $isAssignedEditor = EditorOrderDetailAssignment::where('order_detail_id', $detail->id)
            ->where('editor_id', $actor->id)
            ->exists();

        $this->assertLegalTransition($current, $params->target, $detail, $isManager, $isAssignedEditor);

        OrderEditingStatusChange::create([
            'order_detail_id' => $detail->id,
            'status' => $params->target,
            'changed_by' => $actor->id,
            'changed_at' => now(),
        ]);
    }

    /**
     * @throws ValidationException
     */
    private function assertLegalTransition(
        EditingStatus $current,
        EditingStatus $target,
        OrderDetail $detail,
        bool $isManager,
        bool $isAssignedEditor,
    ): void {
        // Structurally reachable targets from $current, ignoring gating (all gates forced open).
        $structurallyReachable = EditingStatus::allowedTargets($current, isManager: true, isAssignedEditor: true, productionEnabled: true);

        if (! in_array($target, $structurallyReachable, true)) {
            throw ValidationException::withMessages([
                'status' => 'Esta transición de estado no está permitida.',
            ]);
        }

        $productionEnabled = $detail->production_enabled_at !== null;
        $permitted = EditingStatus::allowedTargets($current, $isManager, $isAssignedEditor, $productionEnabled);

        if (in_array($target, $permitted, true)) {
            return;
        }

        if ($current === EditingStatus::Pendiente) {
            if (! $isAssignedEditor) {
                throw ValidationException::withMessages([
                    'status' => 'Solo el editor asignado puede editar esta foto.',
                ]);
            }

            throw ValidationException::withMessages([
                'status' => 'Esta foto todavía no tiene la producción habilitada.',
            ]);
        }

        if ($current === EditingStatus::ACorregir) {
            throw ValidationException::withMessages([
                'status' => 'Solo el editor asignado puede editar esta foto.',
            ]);
        }

        throw ValidationException::withMessages([
            'status' => 'No tenés permiso para cambiar este estado de edición.',
        ]);
    }
}
