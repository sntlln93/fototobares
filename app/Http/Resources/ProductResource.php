<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @var Product
     */
    public $resource;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {

        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'unit_price' => $this->resource->unit_price,
            'max_payments' => $this->resource->max_payments,
            'financed_price' => $this->resource->financed_price,
            'product_type_id' => $this->resource->product_type_id,
            'variants' => $this->resource->variants ?? [],
        ];
    }
}
