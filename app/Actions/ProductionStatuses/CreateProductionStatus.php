<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\CreateProductionStatusData;
use App\Models\ProductionStatus;

/**
 * @implements ActionContract<CreateProductionStatusData>
 */
class CreateProductionStatus implements ActionContract
{
    /**
     * Append a new stage at the end of the product's chain.
     *
     * @param  CreateProductionStatusData  $params
     */
    public function handle(DtoContract $params): ProductionStatus
    {
        $lastPosition = ProductionStatus::query()
            ->where('product_id', $params->productId)
            ->max('position');

        return ProductionStatus::create([
            'product_id' => $params->productId,
            'name' => $params->name,
            'position' => (is_numeric($lastPosition) ? (int) $lastPosition : 0) + 1,
        ]);
    }
}
