<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Stockable
 */
class StockableResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'quantity' => $this->quantity,
            // Products consuming this stockable, derived through the
            // production stages that use it
            'products' => $this->whenLoaded('productionStatuses', function () {
                $products = $this->productionStatuses
                    ->map(fn ($status) => $status->product)
                    ->filter()
                    ->unique('id')
                    ->values();

                return ProductResource::collection($products);
            }),
            'unit' => $this->unit,
            'alert_at' => $this->alert_at,
        ];
    }
}
