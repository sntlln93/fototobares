<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\SetDetailPriorityData;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<SetDetailPriorityData>
 */
class SetDetailPriority implements ActionContract
{
    /**
     * Flag (or unflag) a detail of an order as priority. Cancelled orders,
     * delivered and recycled details cannot be prioritized.
     *
     * @param  SetDetailPriorityData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede priorizar un producto de un pedido cancelado.',
            ]);
        }

        $detail = $order->details()
            ->whereNull('recycled_to')
            ->whereNull('delivered_at')
            ->find($params->detailId);

        if ($detail === null) {
            throw ValidationException::withMessages([
                'detail_id' => 'No se encontró el producto en este pedido.',
            ]);
        }

        $detail->priority = $params->priority;
        $detail->save();
    }
}
