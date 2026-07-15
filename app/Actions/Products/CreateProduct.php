<?php

declare(strict_types=1);

namespace App\Actions\Products;

use App\Actions\ProductionStatuses\CreateProductionStatus;
use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\CreateProductionStatusData;
use App\Data\Products\CreateProductData;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<CreateProductData>
 */
class CreateProduct implements ActionContract
{
    public function __construct(private CreateProductionStatus $createStage) {}

    /**
     * Create a product with its initial single-stage chain: the final
     * stage. The user shapes the rest (and the stockable consumption)
     * in the production stages screen.
     *
     * @param  CreateProductData  $params
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

            $this->createStage->handle(new CreateProductionStatusData($product->id, 'Terminado'));

            return $product;
        });
    }
}
