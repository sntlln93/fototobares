<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\DetailVariantSnapshotData;
use App\Data\Orders\OrderUpdateData;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<OrderUpdateData>
 */
class UpdateOrderAction implements ActionContract
{
    public function __construct(private readonly SnapshotDetailVariantAction $snapshotDetailVariant) {}

    /**
     * Update an order, its client and its product details.
     *
     * @param  OrderUpdateData  $params
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;
        $data = $params->data;

        DB::transaction(function () use ($order, $data) {
            $order->update([
                'total_price' => $data->totalPrice,
                'payment_plan' => $data->paymentPlan,
                'due_date' => $data->dueDate,
                'child_name' => $data->childName,
                'attended_photo_session' => $data->attendedPhotoSession,
            ]);

            $order->client()->update([
                'name' => $data->name,
                'phone' => $data->phone,
            ]);

            $orderDetails = $data->orderDetails;

            $products = Product::whereIn('id', collect($orderDetails)->pluck('productId'))
                ->get(['id', 'variants'])
                ->keyBy('id');

            // Details are addressed row by row, never keyed by product: an
            // order may repeat a product (two mugs with different names, or a
            // combo carrying several units of the same one) and syncing by
            // product_id collapsed those rows into a single one
            foreach ($orderDetails as $detail) {
                $productModel = $products->get($detail->productId);

                $attributes = [
                    'variant' => $this->snapshotDetailVariant->handle(new DetailVariantSnapshotData(
                        definitions: $productModel->variants ?? [],
                        selection: $detail->variant ?? [],
                    )),
                    'note' => $detail->note,
                ];

                if ($detail->id === null) {
                    $order->products()->attach($detail->productId, $attributes);

                    continue;
                }

                // Scoped to the order: an id from another order matches nothing.
                // Updated through the model so the variant cast applies
                $order->details()
                    ->whereKey($detail->id)
                    ->first()
                    ?->update($attributes);
            }
        });
    }
}
