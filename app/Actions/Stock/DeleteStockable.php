<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Stock\DeleteStockableData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<DeleteStockableData>
 */
class DeleteStockable implements ActionContract
{
    /**
     * Delete a stockable, detaching it from any production stages first.
     *
     * @param  DeleteStockableData  $params
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
