<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Products\ProductDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ProductDeletionData>
 */
class DeleteProductAction implements ActionContract
{
    /**
     * Delete a product, detaching it from any combos first.
     *
     * @param  ProductDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $product = $params->product;

        DB::transaction(function () use ($product) {
            $product->combos()->detach();
            $product->delete();
        });
    }
}
