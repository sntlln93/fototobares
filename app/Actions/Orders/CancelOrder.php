<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelOrder implements ActionContract
{
    public function __construct(private StockService $stockService) {}

    /**
     * Cancel an order, sending each product back to stock (returning its
     * supplies) or to recycling, as chosen per product.
     *
     * @param  array<string, mixed>  $params  {order: Order, data: array<string, mixed>, user: ?User}
     *
     * @throws ValidationException
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var array<string, mixed> $data */
        $data = $params['data'];

        /** @var User|null $user */
        $user = $params['user'];

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'El pedido ya está cancelado.',
            ]);
        }

        /** @var array<int, array{detail_id: int, destination: string}> $destinations */
        $destinations = $data['destinations'];

        $details = $order->details()->get()->keyBy('id');

        foreach ($destinations as $destination) {
            if (! $details->has($destination['detail_id'])) {
                throw ValidationException::withMessages([
                    'destinations' => 'Uno de los productos no pertenece a este pedido.',
                ]);
            }
        }

        DB::transaction(function () use ($order, $destinations, $details, $user) {
            foreach ($destinations as $destination) {
                /** @var OrderDetail $detail */
                $detail = $details->get($destination['detail_id']);

                $detail->recycled_to = $destination['destination'];
                $detail->save();

                if ($destination['destination'] === 'stock') {
                    $this->stockService->reverseForDetail($detail, $user);
                }
            }

            $order->cancelled_at = now();
            $order->save();
        });
    }
}
