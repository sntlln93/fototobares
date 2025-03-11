<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @var \App\Models\Product
     */
    public $resource;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        /**
         * @var array{
         *  photo_types: array<int, 'individual'|'grupo'>,
         *  orientations: array<int, 'horizontal'|'vertical'>,
         *  backgrounds: array<string>,
         *  colors: array<string>,
         *  dimentions: string,
         * }
         */
        $variants = $this->resource->variants
            ? [
                'photo_types' => $this->resource->variants['photo_types'],
                'orientations' => $this->resource->variants['orientations'],
                'backgrounds' => $this->resource->variants['backgrounds'],
                'colors' => $this->resource->variants['colors'],
                'dimentions' => $this->resource->variants['dimentions'],
            ] : [];

        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'unit_price' => $this->resource->unit_price,
            'max_payments' => $this->resource->max_payments,
            'product_type_id' => $this->resource->product_type_id,
            'variants' => $variants,
        ];
    }
}
