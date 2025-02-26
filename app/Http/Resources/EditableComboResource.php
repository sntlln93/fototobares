<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EditableComboResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'suggested_price' => $this->resource->suggested_price,
            'suggested_max_payments' => $this->resource->suggested_max_payments,
            'products' => $this->products->map(function ($p) {
                return [
                    'id' => $p->id,
                    'quantity' => $p->pivot->quantity,
                    'variants' => $p->pivot->variants,
                ];
            }),
        ];
    }
}
