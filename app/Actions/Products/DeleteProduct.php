<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Contracts\ActionContract;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class DeleteProduct implements ActionContract
{
    /**
     * Delete a product, detaching it from any combos first.
     *
     * @param  array<string, mixed>  $params  {product: Product}
     */
    public function handle(array $params): void
    {
        /** @var Product $product */
        $product = $params['product'];

        DB::transaction(function () use ($product) {
            $product->combos()->detach();
            $product->delete();
        });
    }
}
