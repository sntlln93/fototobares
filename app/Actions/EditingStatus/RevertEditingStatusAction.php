<?php

declare(strict_types=1);

namespace App\Actions\EditingStatus;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditingStatus\RevertEditingStatusData;
use App\Enums\EditingStatus;
use App\Models\OrderDetail;
use App\Models\OrderEditingStatusChange;
use Illuminate\Validation\ValidationException;

/**
 * Reverts the latest editing status transition by appending a new
 * append-only history entry whose status is the immediately-prior state.
 * Only the author of the transition being undone may revert it.
 *
 * @implements ActionContract<RevertEditingStatusData>
 */
class RevertEditingStatusAction implements ActionContract
{
    /**
     * @param  RevertEditingStatusData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $detail = OrderDetail::with('editingStatusChanges')->findOrFail($params->orderDetailId);

        $history = $detail->editingStatusChanges
            ->sortBy([['changed_at', 'desc'], ['id', 'desc']])
            ->values();

        $latest = $history->first();

        if ($latest === null) {
            throw ValidationException::withMessages([
                'status' => 'No hay ninguna transición para revertir.',
            ]);
        }

        if ($latest->changed_by !== $params->revertedById) {
            throw ValidationException::withMessages([
                'status' => 'Solo quien hizo la transición puede revertirla.',
            ]);
        }

        $previous = $history->get(1);
        $previousStatus = $previous->status ?? EditingStatus::Pendiente;

        OrderEditingStatusChange::create([
            'order_detail_id' => $detail->id,
            'status' => $previousStatus,
            'changed_by' => $params->revertedById,
            'changed_at' => now(),
            'is_revert' => true,
        ]);
    }
}
