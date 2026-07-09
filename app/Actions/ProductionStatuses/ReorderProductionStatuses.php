<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Models\ProductionStatus;
use Illuminate\Support\Facades\DB;

class ReorderProductionStatuses
{
    /**
     * Apply the given order to the stages of a product type. Expects an
     * id list already validated against the type's stages.
     *
     * @param  array<int, int>  $orderedIds
     */
    public function handle(int $productTypeId, array $orderedIds): void
    {
        DB::transaction(function () use ($productTypeId, $orderedIds) {
            // Two-phase update: (product_type_id, position) is unique, so
            // park every stage above the current range first
            $maxPosition = ProductionStatus::query()
                ->where('product_type_id', $productTypeId)
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
