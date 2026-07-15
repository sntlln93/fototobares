<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\ReorderProductionStatusesData;
use App\Models\ProductionStatus;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ReorderProductionStatusesData>
 */
class ReorderProductionStatuses implements ActionContract
{
    /**
     * Apply the given order to the stages of a product. Expects an id
     * list already validated against the product's stages.
     *
     * @param  ReorderProductionStatusesData  $params
     */
    public function handle(DtoContract $params): void
    {
        $productId = $params->productId;
        $orderedIds = $params->orderedIds;

        DB::transaction(function () use ($productId, $orderedIds) {
            // Two-phase update: (product_id, position) is unique, so
            // park every stage above the current range first
            $maxPosition = ProductionStatus::query()
                ->where('product_id', $productId)
                ->max('position');

            $offset = is_numeric($maxPosition) ? (int) $maxPosition : 0;

            foreach ($orderedIds as $index => $id) {
                ProductionStatus::whereKey($id)->update(['position' => $offset + $index + 1]);
            }

            foreach ($orderedIds as $index => $id) {
                ProductionStatus::whereKey($id)->update(['position' => $index + 1]);
            }
        });
    }
}
