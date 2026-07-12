<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Models\ProductionStatus;
use Illuminate\Support\Facades\DB;

class ReorderProductionStatuses implements ActionContract
{
    /**
     * Apply the given order to the stages of a product. Expects an id
     * list already validated against the product's stages.
     *
     * @param  array<string, mixed>  $params  {product_id: int, ordered_ids: array<int, int>}
     */
    public function handle(array $params): void
    {
        $productId = $params['product_id'];

        /** @var array<int, int> $orderedIds */
        $orderedIds = $params['ordered_ids'];

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
