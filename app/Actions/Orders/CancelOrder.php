<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\CancelOrderData;
use App\Models\OrderDetail;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<CancelOrderData>
 */
class CancelOrder implements ActionContract
{
    public function __construct(private StockService $stockService) {}

    /**
     * Cancel an order, sending each product back to stock (returning its
     * supplies) or to recycling, as chosen per product.
     *
     * @param  CancelOrderData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;
        $user = $params->user;

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'El pedido ya está cancelado.',
            ]);
        }

        $destinations = $params->destinations;

        $details = $order->details()->get()->keyBy('id');

        foreach ($destinations as $destination) {
            if (! $details->has($destination->detailId)) {
                throw ValidationException::withMessages([
                    'destinations' => 'Uno de los productos no pertenece a este pedido.',
                ]);
            }
        }

        DB::transaction(function () use ($order, $destinations, $details, $user) {
            foreach ($destinations as $destination) {
                /** @var OrderDetail $detail */
                $detail = $details->get($destination->detailId);

                $detail->recycled_to = $destination->destination;
                $detail->save();

                if ($destination->destination === 'stock') {
                    $this->stockService->reverseForDetail($detail, $user);
                }
            }

            $order->cancelled_at = now();
            $order->save();
        });
    }
}
