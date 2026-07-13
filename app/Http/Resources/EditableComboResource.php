<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Combo;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Combo
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
            'products' => $this->products->map(function (Product $p) {
                return [
                    'id' => $p->id,
                    /* @phpstan-ignore-next-line */
                    'quantity' => $p->getRelationValue('pivot')->quantity,
                    /* @phpstan-ignore-next-line */
                    'subtract_value' => $p->getRelationValue('pivot')->subtract_value,
                    /* @phpstan-ignore-next-line */
                    'variants' => $p->getRelationValue('pivot')->variants,
                ];
            }),
        ];
    }
}
