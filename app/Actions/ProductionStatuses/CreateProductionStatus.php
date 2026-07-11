<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Models\ProductionStatus;

class CreateProductionStatus implements ActionContract
{
    /**
     * Append a new stage at the end of the product's chain.
     *
     * @param  array<string, mixed>  $params  {product_id: int, name: string}
     */
    public function handle(array $params): ProductionStatus
    {
        $lastPosition = ProductionStatus::query()
            ->where('product_id', $params['product_id'])
            ->max('position');

        return ProductionStatus::create([
            'product_id' => $params['product_id'],
            'name' => $params['name'],
            'position' => (is_numeric($lastPosition) ? (int) $lastPosition : 0) + 1,
        ]);
    }
}
