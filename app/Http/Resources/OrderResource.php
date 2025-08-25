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
            'payment_plan' => $this->payment_plan,
            'total_price' => $this->total_price,
            'payments' => $this->whenLoaded('payments', function () {
                return $this->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'type' => $payment->type,
                        'proof_of_payment' => $payment->proof_of_payment,
                        'order_id' => $payment->order_id,
                        'paid_at' => $payment->created_at->diffForHumans(), //@phpstan-ignore-line
                    ];
                });
            }),
            'products' => $this->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'type' => $product->type,
                    'product_type_id' => $product->product_type_id,
                    'product_id' => $product->pivot->product_id, //@phpstan-ignore-line
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
