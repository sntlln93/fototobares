<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Stock\StockableDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<StockableDeletionData>
 */
class DeleteStockableAction implements ActionContract
{
    /**
     * Delete a stockable, detaching it from any production stages first.
     *
     * @param  StockableDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $stockable = $params->stockable;

        DB::transaction(function () use ($stockable) {
            $stockable->productionStatuses()->detach();
            $stockable->delete();
        });
    }
}
