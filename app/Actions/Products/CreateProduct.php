<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Actions\ProductionStatuses\CreateProductionStatus;
use App\Contracts\ActionContract;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CreateProduct implements ActionContract
{
    public function __construct(private CreateProductionStatus $createStage) {}

    /**
     * Create a product with its initial single-stage chain: the final
     * stage. The user shapes the rest (and the stockable consumption)
     * in the production stages screen.
     *
     * @param  array<string, mixed>  $params  product attributes
     */
    public function handle(array $params): Product
    {
        return DB::transaction(function () use ($params) {
            $product = Product::create($params);

            $this->createStage->handle(['product_id' => $product->id, 'name' => 'Terminado']);

            return $product;
        });
    }
}
