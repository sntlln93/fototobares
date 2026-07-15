<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Actions\ProductionStatuses\CreateProductionStatusAction;
use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\ProductionStatusCreationData;
use App\Data\Products\ProductCreationData;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ProductCreationData>
 */
class CreateProductAction implements ActionContract
{
    public function __construct(private CreateProductionStatusAction $createStage) {}

    /**
     * Create a product with its initial single-stage chain: the final
     * stage. The user shapes the rest (and the stockable consumption)
     * in the production stages screen.
     *
     * @param  ProductCreationData  $params
     */
    public function handle(DtoContract $params): Product
    {
        return DB::transaction(function () use ($params) {
            $product = Product::create([
                'name' => $params->name,
                'unit_price' => $params->unitPrice,
                'max_payments' => $params->maxPayments,
                'product_type_id' => $params->productTypeId,
                'variants' => $params->variants,
            ]);

            $this->createStage->handle(new ProductionStatusCreationData($product->id, 'Terminado'));

            return $product;
        });
    }
}
