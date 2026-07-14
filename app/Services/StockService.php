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
     * Apply every stockable delta hung from the stages the detail has
     * reached or passed (positive deltas add stock, negative deltas
     * consume it). Cumulative (batch jumps apply the skipped stages) and
     * idempotent per (stage, stockable): moving back and forth never
     * applies the same delta twice, and going back never reverses it.
     */
    public function applyForDetail(OrderDetail $detail, ?User $user = null): void
    {
        $detail->loadMissing('productionStatus');

        $position = $detail->productionStatus?->position;

        if ($position === null) {
            return;
        }

        $stages = ProductionStatus::query()
            ->where('product_id', $detail->product_id)
            ->where('position', '<=', $position)
            ->orderBy('position')
            ->with('stockables')
            ->get();

        if ($stages->sum(fn (ProductionStatus $status) => $status->stockables->count()) === 0) {
            return;
        }

        /** @var array<string, true> $applied */
        $applied = StockMovement::query()
            ->where('order_detail_id', $detail->id)
            ->where('reason', 'producción')
            ->get(['production_status_id', 'stockable_id'])
            ->mapWithKeys(fn (StockMovement $movement) => ["{$movement->production_status_id}:{$movement->stockable_id}" => true])
            ->all();

        foreach ($stages as $status) {
            foreach ($status->stockables as $stockable) {
                if (isset($applied["{$status->id}:{$stockable->id}"])) {
                    continue;
                }

                $delta = (int) $stockable->getRelationValue('pivot')->quantity; // @phpstan-ignore-line

                $stockable->movements()->create([
                    'order_detail_id' => $detail->id,
                    'production_status_id' => $status->id,
                    'user_id' => $user?->id,
                    'quantity' => $delta,
                    'reason' => 'producción',
                ]);

                $stockable->increment('quantity', $delta);
            }
        }
    }

    /**
     * Reverse the net balance the detail's movements left on each
     * stockable: net-consumed stock comes back, net-produced stock is
     * subtracted back out.
     */
    public function reverseForDetail(OrderDetail $detail, ?User $user = null): void
    {
        /** @var array<int, int|string> $balances */
        $balances = StockMovement::query()
            ->where('order_detail_id', $detail->id)
            ->selectRaw('stockable_id, SUM(quantity) as balance')
            ->groupBy('stockable_id')
            ->pluck('balance', 'stockable_id')
            ->all();

        foreach ($balances as $stockableId => $balance) {
            $delta = -(int) $balance;

            if ($delta === 0) {
                continue;
            }

            $stockable = Stockable::find($stockableId);

            if ($stockable === null) {
                continue;
            }

            $stockable->movements()->create([
                'order_detail_id' => $detail->id,
                'user_id' => $user?->id,
                'quantity' => $delta,
                'reason' => $delta > 0 ? 'devolución por cancelación' : 'ajuste por cancelación',
            ]);

            $stockable->increment('quantity', $delta);
        }
    }
}
