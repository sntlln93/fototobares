<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class UpdateOrder implements ActionContract
{
    public function __construct(private readonly SnapshotDetailVariant $snapshotDetailVariant) {}

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

            $products = Product::whereIn('id', collect($orderDetails)->pluck('product_id'))
                ->get(['id', 'variants'])
                ->keyBy('id');

            // Details are addressed row by row, never keyed by product: an
            // order may repeat a product (two mugs with different names, or a
            // combo carrying several units of the same one) and syncing by
            // product_id collapsed those rows into a single one
            foreach ($orderDetails as $detail) {
                /** @var int $productId */
                $productId = $detail['product_id'];

                $productModel = $products->get($productId);

                /** @var array<string, string|null> $selection */
                $selection = $detail['variant'] ?? [];

                $attributes = [
                    'variant' => $this->snapshotDetailVariant->handle([
                        'definitions' => $productModel->variants ?? [],
                        'selection' => $selection,
                    ]),
                    'note' => $detail['note'],
                ];

                if (! isset($detail['id'])) {
                    $order->products()->attach($productId, $attributes);

                    continue;
                }

                // Scoped to the order: an id from another order matches nothing.
                // Updated through the model so the variant cast applies
                $order->details()
                    ->whereKey($detail['id'])
                    ->first()
                    ?->update($attributes);
            }
        });
    }
}
