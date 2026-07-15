<?php

declare(strict_types=1);

namespace App\Actions\Deliveries;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Deliveries\DeliveryMarkingData;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<DeliveryMarkingData>
 */
class MarkDeliveriesAction implements ActionContract
{
    /**
     * Deliver (or undeliver) the given details of an order. Cancelled orders
     * are rejected and recycled details are ignored.
     *
     * @param  DeliveryMarkingData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede registrar entregas de un pedido cancelado.',
            ]);
        }

        $details = $order->details()
            ->whereIn('id', $params->detailIds)
            ->whereNull('recycled_to')
            ->get();

        if ($details->isEmpty()) {
            throw ValidationException::withMessages([
                'detail_ids' => 'No se encontraron productos para entregar en este pedido.',
            ]);
        }

        $action = $params->action;

        DB::transaction(function () use ($details, $action) {
            foreach ($details as $detail) {
                $detail->delivered_at = $action === 'deliver' ? now() : null;
                $detail->save();
            }
        });
    }
}
