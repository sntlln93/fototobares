<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Actions\ProductionStatuses\CreateProductionStatus;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CreateProduct
{
    public function __construct(private CreateProductionStatus $createStage) {}

    /**
     * Create a product with its initial single-stage chain: the final
     * stage. The user shapes the rest (and the stockable consumption)
     * in the production stages screen.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function handle(array $attributes): Product
    {
        return DB::transaction(function () use ($attributes) {
            $product = Product::create($attributes);

            $this->createStage->handle($product->id, 'Terminado');

            return $product;
        });
    }
}
