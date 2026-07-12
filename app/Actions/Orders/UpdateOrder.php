<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class UpdateOrder implements ActionContract
{
    /**
     * Update an order, its client and its product details.
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
                'total_price' => $data['total_price'],
                'payment_plan' => $data['payment_plan'],
                'due_date' => $data['due_date'],
                'child_name' => $data['child_name'] ?? null,
                'attended_photo_session' => $data['attended_photo_session'] ?? null,
            ]);

            $order->client()->update([
                'name' => $data['name'],
                'phone' => $data['phone'],
            ]);

            /** @var array<int, array<string, mixed>> $orderDetails */
            $orderDetails = $data['order_details'];

            $order->products()->sync(
                collect($orderDetails)->mapWithKeys(function (array $product) {
                    /** @var int $productId */
                    $productId = $product['product_id'];

                    return [$productId => [
                        'variant' => $product['variant'] ?? [],
                        'note' => $product['note'],
                    ]];
                })->toArray()
            );
        });
    }
}
