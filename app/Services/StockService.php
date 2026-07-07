<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OrderDetail;
use App\Models\User;

class StockService
{
    /**
     * Deduct one unit of every stockable used by the detail's product.
     * Idempotent: does nothing if stock was already deducted for the detail.
     */
    public function deductForDetail(OrderDetail $detail, ?User $user = null): void
    {
        if ($detail->stock_deducted_at !== null) {
            return;
        }

        $detail->loadMissing('product.stockables');

        /** @var \App\Models\Product|null $product */
        $product = $detail->product;

        foreach ($product->stockables ?? [] as $stockable) {
            $stockable->movements()->create([
                'order_detail_id' => $detail->id,
                'user_id' => $user?->id,
                'quantity' => -1,
                'reason' => 'producción',
            ]);

            $stockable->decrement('quantity');
        }

        $detail->stock_deducted_at = now();
        $detail->save();
    }

    /**
     * Return to stock the stockables previously deducted for the detail.
     * Does nothing if stock was never deducted.
     */
    public function returnForDetail(OrderDetail $detail, ?User $user = null): void
    {
        if ($detail->stock_deducted_at === null) {
            return;
        }

        $detail->loadMissing('product.stockables');

        /** @var \App\Models\Product|null $product */
        $product = $detail->product;

        foreach ($product->stockables ?? [] as $stockable) {
            $stockable->movements()->create([
                'order_detail_id' => $detail->id,
                'user_id' => $user?->id,
                'quantity' => 1,
                'reason' => 'devolución por cancelación',
            ]);

            $stockable->increment('quantity');
        }

        $detail->stock_deducted_at = null;
        $detail->save();
    }
}
