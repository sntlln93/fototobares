<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Combo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Combo
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
            'default_payments' => $this->default_payments,
            'products' => ProductResource::collection($this->products),
        ];
    }
}
