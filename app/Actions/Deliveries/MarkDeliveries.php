<?php

declare(strict_types=1);

namespace App\Actions\Deliveries;

use App\Contracts\ActionContract;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MarkDeliveries implements ActionContract
{
    /**
     * Deliver (or undeliver) the given details of an order. Cancelled orders
     * are rejected and recycled details are ignored.
     *
     * @param  array<string, mixed>  $params  {order: Order, detail_ids: array<int, int>, action: string}
     *
     * @throws ValidationException
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var array<int, int> $detailIds */
        $detailIds = $params['detail_ids'];

        /** @var string $action */
        $action = $params['action'];

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede registrar entregas de un pedido cancelado.',
            ]);
        }

        $details = $order->details()
            ->whereIn('id', $detailIds)
            ->whereNull('recycled_to')
            ->get();

        if ($details->isEmpty()) {
            throw ValidationException::withMessages([
                'detail_ids' => 'No se encontraron productos para entregar en este pedido.',
            ]);
        }

        DB::transaction(function () use ($details, $action) {
            foreach ($details as $detail) {
                $detail->delivered_at = $action === 'deliver' ? now() : null;
                $detail->save();
            }
        });
    }
}
