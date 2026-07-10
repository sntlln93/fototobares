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
     * Last production position by product, cached for the request.
     *
     * @var array<int, int>|null
     */
    private static ?array $lastPositions = null;

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
            'status' => $this->aggregateStatus($details),
            'paid_total' => $this->whenLoaded('payments', fn () => $this->sumPayments()),
            'balance' => $this->whenLoaded('payments', fn () => $this->total_price - $this->sumPayments()),
            'can_edit' => $this->canEdit(),
            'can_delete' => $this->cancelled_at === null && $this->payments()->doesntExist(),
            'payments' => $this->whenLoaded('payments', function () {
                return $this->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'type' => $payment->type,
                        'proof_of_payment' => $payment->proof_of_payment !== null
                            ? Storage::url($payment->proof_of_payment)
                            : null,
                        'order_id' => $payment->order_id,
                        'paid_at' => $payment->created_at->diffForHumans(), // @phpstan-ignore-line
                        'paid_on' => $payment->created_at->format('d/m/Y'), // @phpstan-ignore-line
                    ];
                });
            }),
            'products' => $this->products->map(function ($product) use ($details) {
                /** @var OrderDetail|null $detail */
                $detail = $details->get($product->pivot->id); // @phpstan-ignore-line

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
                    'delivered_at' => $product->pivot->delivered_at,  // @phpstan-ignore-line
                    'production_status' => $detail?->productionStatus?->name,
                    'production_status_id' => $detail?->production_status_id,
                    'priority' => $detail?->priority,
                    'recycled_to' => $detail?->recycled_to,
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

    private function canEdit(): bool
    {
        if ($this->cancelled_at !== null) {
            return false;
        }

        if ($this->payment_plan <= 0) {
            return false;
        }

        $totalPaid = $this->payments()->sum('amount');
        $firstQuote = $this->total_price / $this->payment_plan;

        return $totalPaid < $firstQuote;
    }

    /**
     * @param  Collection<int|string, OrderDetail>  $details
     */
    private function aggregateStatus($details): ?string
    {
        if ($this->cancelled_at !== null) {
            return 'cancelado';
        }

        if ($details->isEmpty()) {
            return null;
        }

        $active = $details->filter(fn (OrderDetail $detail) => $detail->recycled_to === null);

        if ($active->isEmpty()) {
            return null;
        }

        $delivered = $active->filter(fn (OrderDetail $detail) => $detail->delivered_at !== null);

        if ($delivered->count() === $active->count()) {
            return 'entregado';
        }

        if ($delivered->isNotEmpty()) {
            return 'entregado parcial';
        }

        if ($active->every(fn (OrderDetail $detail) => $detail->production_status_id === null)) {
            return 'pendiente';
        }

        $lastPositions = self::lastPositions();

        $allFinished = $active->every(function (OrderDetail $detail) use ($lastPositions) {
            $status = $detail->productionStatus;

            if ($status === null) {
                return false;
            }

            return $status->position === ($lastPositions[$status->product_id] ?? null);
        });

        return $allFinished ? 'terminado' : 'en producción';
    }

    /**
     * @return array<int, int>
     */
    private static function lastPositions(): array
    {
        if (self::$lastPositions === null) {
            /** @var array<int, int> $positions */
            $positions = ProductionStatus::query()
                ->selectRaw('product_id, MAX(position) as last_position')
                ->groupBy('product_id')
                ->pluck('last_position', 'product_id')
                ->all();

            self::$lastPositions = $positions;
        }

        return self::$lastPositions;
    }
}
