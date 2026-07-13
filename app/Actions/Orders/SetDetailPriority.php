<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class SetDetailPriority implements ActionContract
{
    /**
     * Flag (or unflag) a detail of an order as priority. Cancelled orders,
     * delivered and recycled details cannot be prioritized.
     *
     * @param  array<string, mixed>  $params  {order: Order, detail_id: int, priority: bool}
     *
     * @throws ValidationException
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var int $detailId */
        $detailId = $params['detail_id'];

        /** @var bool $priority */
        $priority = $params['priority'];

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede priorizar un producto de un pedido cancelado.',
            ]);
        }

        $detail = $order->details()
            ->whereNull('recycled_to')
            ->whereNull('delivered_at')
            ->find($detailId);

        if ($detail === null) {
            throw ValidationException::withMessages([
                'detail_id' => 'No se encontró el producto en este pedido.',
            ]);
        }

        $detail->priority = $priority;
        $detail->save();
    }
}
