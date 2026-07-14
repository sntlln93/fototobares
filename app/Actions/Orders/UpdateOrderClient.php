<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class UpdateOrderClient implements ActionContract
{
    /**
     * Update an order's client data and attended_photo_session flag.
     *
     * @param  array<string, mixed>  $params  {order: Order, data: array<string, mixed>}
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var array<string, mixed> $data */
        $data = $params['data'];

        DB::transaction(function () use ($order, $data) {
            $order->update([
                'child_name' => $data['child_name'] ?? null,
                'attended_photo_session' => $data['attended_photo_session'] ?? null,
            ]);

            $order->client()->update([
                'name' => $data['name'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]);
        });
    }
}
