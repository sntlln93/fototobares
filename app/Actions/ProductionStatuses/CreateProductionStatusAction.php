<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\ProductionStatusCreationData;
use App\Models\ProductionStatus;

/**
 * @implements ActionContract<ProductionStatusCreationData>
 */
class CreateProductionStatusAction implements ActionContract
{
    /**
     * Append a new stage at the end of the product's chain.
     *
     * @param  ProductionStatusCreationData  $params
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
