<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\ProductionStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Order
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
        /** @var Classroom $classroom */
        $classroom = $this->classroom;

        /** @var Collection<int|string, OrderDetail> $details */
        $details = $this->relationLoaded('details')
            ? $this->details->keyBy('id')
            : collect();

        $photo = $this->relationLoaded('details') ? $this->photo() : null;

        return [
            'id' => $this->id,
            'client' => $this->client,
            'payment_plan' => $this->payment_plan,
            'total_price' => $this->total_price,
            'child_name' => $this->child_name,
            'attended_photo_session' => $this->attended_photo_session,
            'photo_number' => $this->photo_number,
            'photo_url' => $photo !== null ? Storage::url($photo->file_path) : null,
            'cancelled_at' => $this->cancelled_at?->format('d/m/Y'),
            'status' => $this->aggregateStatus(),
            'paid_total' => $this->whenLoaded('payments', fn () => $this->sumPayments()),
            'balance' => $this->whenLoaded('payments', fn () => $this->total_price - $this->sumPayments()),
            'paid_installments' => $this->whenLoaded('payments', fn () => $this->paidInstallments()),
            'current_installment_fraction' => $this->whenLoaded('payments', fn () => $this->currentInstallmentFraction()),
            'can_edit' => $this->canEdit(),
            'first_installment_paid' => $this->firstInstallmentPaid(),
            'can_delete' => $this->cancelled_at === null && $this->payments()->doesntExist(),
            'payments' => $this->whenLoaded('payments', function () {
                return $this->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'type' => $payment->type,
                        'transaction_number' => $payment->transaction_number,
                        'order_id' => $payment->order_id,
                        'paid_on' => $payment->paid_on->format('Y-m-d'),
                    ];
                });
            }),
            'notes' => $this->whenLoaded('notes', function () {
                return $this->notes->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'body' => $note->body,
                        'created_at' => $note->created_at->format('d/m/Y H:i'),
                    ];
                });
            }),
            'products' => $this->products->map(function ($product) use ($details) {
                /** @var OrderDetail|null $detail */
                $detail = $details->get($product->pivot->id); // @phpstan-ignore-line

                $stockMovementsCount = $detail?->getAttribute('stock_movements_count');

                return [
                    'id' => $product->id,
                    'order_detail_id' => $product->pivot->id, // @phpstan-ignore-line
                    'name' => $product->name,
                    'type' => $product->type,
                    'product_type_id' => $product->product_type_id,
                    'unit_price' => $product->unit_price,
                    'financed_price' => $product->financed_price,
                    'max_payments' => $product->max_payments,
                    'product_id' => $product->pivot->product_id, // @phpstan-ignore-line
                    'note' => $product->pivot->note,  // @phpstan-ignore-line
                    'variant' => $product->pivot->variant,  // @phpstan-ignore-line
                    'variants' => $product->variants ?? [],
                    'delivered_at' => $product->pivot->delivered_at,  // @phpstan-ignore-line
                    'production_status' => $detail?->productionStatus?->name,
                    'production_status_id' => $detail?->production_status_id,
                    'production_enabled' => $detail?->production_enabled_at !== null,
                    'priority' => $product->pivot->priority,  // @phpstan-ignore-line
                    'recycled_to' => $detail?->recycled_to,
                    'has_returnable_stock' => is_numeric($stockMovementsCount) && $stockMovementsCount > 0,
                    'statuses' => $product->relationLoaded('productionStatuses')
                        ? $product->productionStatuses->map(fn (ProductionStatus $status) => [
                            'id' => $status->id,
                            'name' => $status->name,
                            'position' => $status->position,
                        ])
                        : [],
                ];
            }),
            'classroom' => $classroom,
            'school' => $classroom->school,
            'due_date' => $this->due_date->isoFormat('D [de] MMM Y'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function sumPayments(): int
    {
        return $this->payments->reduce(
            fn (int $carry, Payment $payment) => $carry + $payment->amount,
            0,
        );
    }

    /**
     * Installments actually covered by payments, capped at the plan.
     * Mirrors the semantics of `Order::firstInstallmentPaid()`.
     */
    private function paidInstallments(): int
    {
        $plan = (int) $this->payment_plan;

        if ($plan <= 0) {
            return 0;
        }

        $paid = $this->sumPayments();
        $totalPrice = (int) $this->total_price;
        $installment = $totalPrice / $plan;

        if ($installment == 0) {
            return 0;
        }

        return min($plan, (int) floor($paid / $installment));
    }

    /**
     * Fraction (0..1) paid of the current (first incomplete) installment.
     */
    private function currentInstallmentFraction(): float
    {
        $plan = (int) $this->payment_plan;

        if ($plan <= 0) {
            return 0.0;
        }

        $paid = $this->sumPayments();
        $totalPrice = (int) $this->total_price;
        $installment = $totalPrice / $plan;

        if ($installment == 0) {
            return 0.0;
        }

        $paidInstallments = min($plan, (int) floor($paid / $installment));

        if ($paidInstallments >= $plan) {
            return 0.0;
        }

        $remainder = $paid - $paidInstallments * $installment;

        return min(1.0, $remainder / $installment);
    }

    private function canEdit(): bool
    {
        if ($this->cancelled_at !== null) {
            return false;
        }

        if ($this->payment_plan <= 0) {
            return false;
        }

        return ! $this->firstInstallmentPaid();
    }
}
