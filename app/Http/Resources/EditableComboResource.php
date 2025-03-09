<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Combo
 */
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
            'id' => $this->id,
            'name' => $this->name,
            'suggested_price' => $this->suggested_price,
            'suggested_max_payments' => $this->suggested_max_payments,
            'products' => $this->products->map(function (\App\Models\Product $p) {
                return [
                    'id' => $p->id,
                    'quantity' => $p->getRelationValue('pivot')->quantity,
                    'variants' => $p->getRelationValue('pivot')->variants,
                ];
            }),
        ];
    }
}
