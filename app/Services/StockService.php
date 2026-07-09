<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OrderDetail;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use App\Models\StockMovement;
use App\Models\User;

class StockService
{
    /**
     * Deduct every stockable consumed by the stages the detail has
     * reached or passed. Cumulative (batch jumps deduct the skipped
     * stages) and idempotent per stockable: moving back and forth
     * never deducts twice, and going back never returns stock.
     */
    public function deductForDetail(OrderDetail $detail, ?User $user = null): void
    {
        $detail->loadMissing('productionStatus');

        $position = $detail->productionStatus?->position;

        if ($position === null) {
            return;
        }

        /** @var \Illuminate\Support\Collection<int, Stockable> $consumed */
        $consumed = ProductionStatus::query()
            ->where('product_id', $detail->product_id)
            ->where('position', '<=', $position)
            ->with('stockables')
            ->get()
            ->flatMap(fn (ProductionStatus $status) => $status->stockables);

        if ($consumed->isEmpty()) {
            return;
        }

        $deducted = StockMovement::query()
            ->where('order_detail_id', $detail->id)
            ->where('reason', 'producción')
            ->pluck('stockable_id')
            ->all();

        foreach ($consumed as $stockable) {
            if (in_array($stockable->id, $deducted, true)) {
                continue;
            }

            $quantity = (int) $stockable->getRelationValue('pivot')->quantity; // @phpstan-ignore-line

            $stockable->movements()->create([
                'order_detail_id' => $detail->id,
                'user_id' => $user?->id,
                'quantity' => -$quantity,
                'reason' => 'producción',
            ]);

            $stockable->decrement('quantity', $quantity);
        }
    }

    /**
     * Return to stock exactly what the detail's movements deducted and
     * was not returned yet.
     */
    public function returnForDetail(OrderDetail $detail, ?User $user = null): void
    {
        /** @var array<int, int|string> $balances */
        $balances = StockMovement::query()
            ->where('order_detail_id', $detail->id)
            ->selectRaw('stockable_id, SUM(quantity) as balance')
            ->groupBy('stockable_id')
            ->pluck('balance', 'stockable_id')
            ->all();

        foreach ($balances as $stockableId => $balance) {
            $pending = -(int) $balance;

            if ($pending <= 0) {
                continue;
            }

            $stockable = Stockable::find($stockableId);

            if ($stockable === null) {
                continue;
            }

            $stockable->movements()->create([
                'order_detail_id' => $detail->id,
                'user_id' => $user?->id,
                'quantity' => $pending,
                'reason' => 'devolución por cancelación',
            ]);

            $stockable->increment('quantity', $pending);
        }
    }
}
