<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Models\ProductionStatus;

class CreateProductionStatus
{
    /**
     * Append a new stage at the end of the product type's chain.
     */
    public function handle(int $productTypeId, string $name): ProductionStatus
    {
        $lastPosition = ProductionStatus::query()
            ->where('product_type_id', $productTypeId)
            ->max('position');

        return ProductionStatus::create([
            'product_type_id' => $productTypeId,
            'name' => $name,
            'position' => (is_numeric($lastPosition) ? (int) $lastPosition : 0) + 1,
        ]);
    }
}
