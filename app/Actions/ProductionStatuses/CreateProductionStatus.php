<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Models\ProductionStatus;

class CreateProductionStatus
{
    /**
     * Append a new stage at the end of the product's chain.
     */
    public function handle(int $productId, string $name): ProductionStatus
    {
        $lastPosition = ProductionStatus::query()
            ->where('product_id', $productId)
            ->max('position');

        return ProductionStatus::create([
            'product_id' => $productId,
            'name' => $name,
            'position' => (is_numeric($lastPosition) ? (int) $lastPosition : 0) + 1,
        ]);
    }
}
