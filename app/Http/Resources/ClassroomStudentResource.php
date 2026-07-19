<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A single flat row for the classroom's children listing, normalizing an
 * Order or an OrderDraft into the same shape: neither the heavy OrderResource
 * payload nor the draft's own resource fit the table as-is.
 */
class ClassroomStudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $row = $this->resource;

        if ($row instanceof OrderDraft) {
            return [
                'kind' => 'draft',
                'id' => $row->id,
                'photo_number' => $row->photo_number,
                'child_name' => $row->child_name,
                'client_name' => $row->client_name,
                'client_phone' => $row->client_phone,
                'products_count' => count($row->products ?? []),
                'total_price' => $row->total_price,
                'payment_plan' => $row->payment_plan,
                'paid_installments' => 0,
                'current_installment_fraction' => 0.0,
                'due_date' => $row->due_date?->isoFormat('D [de] MMM Y'),
            ];
        }

        /** @var Order $row */
        /** @var Client $client */
        $client = $row->client;

        $productsCount = $row->getAttribute('products_count');

        return [
            'kind' => 'order',
            'id' => $row->id,
            'photo_number' => $row->photo_number,
            'child_name' => $row->child_name,
            'client_name' => $client->name,
            'client_phone' => $client->phone,
            'products_count' => is_numeric($productsCount) ? (int) $productsCount : 0,
            'total_price' => $row->total_price,
            'payment_plan' => $row->payment_plan,
            'paid_installments' => $this->paidInstallments($row),
            'current_installment_fraction' => $this->currentInstallmentFraction($row),
            'due_date' => $row->due_date->isoFormat('D [de] MMM Y'),
        ];
    }

    /**
     * Installments actually covered by payments, capped at the plan.
     * Mirrors the semantics of `Order::firstInstallmentPaid()`.
     */
    private function paidInstallments(Order $order): int
    {
        $plan = (int) $order->payment_plan;

        if ($plan <= 0) {
            return 0;
        }

        $paidAttribute = $order->getAttribute('payments_sum_amount');
        $paid = is_numeric($paidAttribute) ? (int) $paidAttribute : 0;

        $totalPrice = (int) $order->total_price;
        $installment = $totalPrice / $plan;

        if ($installment == 0) {
            return 0;
        }

        return min($plan, (int) floor($paid / $installment));
    }

    /**
     * Fraction (0..1) paid of the current (first incomplete) installment.
     */
    private function currentInstallmentFraction(Order $order): float
    {
        $plan = (int) $order->payment_plan;

        if ($plan <= 0) {
            return 0.0;
        }

        $paidAttribute = $order->getAttribute('payments_sum_amount');
        $paid = is_numeric($paidAttribute) ? (int) $paidAttribute : 0;

        $totalPrice = (int) $order->total_price;
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
}
