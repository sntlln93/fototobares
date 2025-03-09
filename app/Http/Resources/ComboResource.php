<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Combo
 */
class ComboResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'suggested_price' => $this->suggested_price,
            'suggested_max_payments' => $this->suggested_max_payments,
            'products' => ProductResource::collection($this->products),
        ];
    }
}
