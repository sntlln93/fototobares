<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var \App\Models\Classroom $classroom */
        $classroom = $this->classroom;

        return [
            'id' => $this->id,
            'client' => $this->client,
            'payments' => $this->payments,
            'total_price' => $this->total_price,
            'products' => $this->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'note' => $product->pivot->note,  // @phpstan-ignore-line
                    'variant' => $product->pivot->variant,  // @phpstan-ignore-line
                    'delivered_at' => $product->pivot->delivered_at,  // @phpstan-ignore-line
                ];
            }),
            'classroom' => $classroom,
            'school' => $classroom->school,
            'due_date' => $this->due_date->isoFormat('D [de] MMM Y'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
