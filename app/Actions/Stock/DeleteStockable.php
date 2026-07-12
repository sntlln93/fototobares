<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Contracts\ActionContract;
use App\Models\Stockable;
use Illuminate\Support\Facades\DB;

class DeleteStockable implements ActionContract
{
    /**
     * Delete a stockable, detaching it from any production stages first.
     *
     * @param  array<string, mixed>  $params  {stockable: Stockable}
     */
    public function handle(array $params): void
    {
        /** @var Stockable $stockable */
        $stockable = $params['stockable'];

        DB::transaction(function () use ($stockable) {
            $stockable->productionStatuses()->detach();
            $stockable->delete();
        });
    }
}
