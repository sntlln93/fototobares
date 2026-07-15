<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CreateOrder implements ActionContract
{
    public function __construct(
        private readonly AllocatePhotoNumber $allocatePhotoNumber,
        private readonly SnapshotDetailVariant $snapshotDetailVariant,
    ) {}

    /**
     * Create an order with its client and product details, auto-assigning the
     * classroom photo number, and consume the source draft when present.
     *
     * @param  array<string, mixed>  $params  validated order payload
     */
    public function handle(array $params): void
    {
        DB::transaction(function () use ($params) {
            $client = Client::create([
                'name' => $params['name'],
                'phone' => $params['phone'],
            ]);

            $attended = $params['attended_photo_session'] ?? null;

            $classroomId = is_numeric($params['classroom_id']) ? (int) $params['classroom_id'] : 0;

            $draft = isset($params['draft_id']) && is_numeric($params['draft_id'])
                ? OrderDraft::find((int) $params['draft_id'])
                : null;

            // Photos are numbered by classroom following the order in which
            // orders are taken: assign the next photo number automatically,
            // unless the child did not attend the photo session. Completing a
            // draft in its own classroom keeps the number it already got.
            $photoNumber = null;

            if ($attended !== false) {
                $photoNumber = ($draft !== null && $draft->photo_number !== null
                        && $draft->classroom_id === $classroomId)
                    ? $draft->photo_number
                    : $this->allocatePhotoNumber->handle(['classroom_id' => $classroomId]);
            }

            $order = Order::create([
                'client_id' => $client->id,
                'classroom_id' => $classroomId,
                'total_price' => $params['total_price'],
                'payment_plan' => $params['payment_plan'],
                'due_date' => $params['due_date'],
                'child_name' => $params['child_name'] ?? null,
                'attended_photo_session' => $attended,
                'photo_number' => $photoNumber,
            ]);

            /** @var array<int, array<string, mixed>> $orderDetails */
            $orderDetails = $params['order_details'];

            $products = Product::whereIn('id', collect($orderDetails)->pluck('product_id'))
                ->get(['id', 'variants'])
                ->keyBy('id');

            foreach ($orderDetails as $product) {
                /** @var int $productId */
                $productId = $product['product_id'];

                $productModel = $products->get($productId);

                /** @var array<string, string|null> $selection */
                $selection = $product['variant'] ?? [];

                $order->products()->attach($productId, [
                    'variant' => $this->snapshotDetailVariant->handle([
                        'definitions' => $productModel->variants ?? [],
                        'selection' => $selection,
                    ]),
                    'note' => $product['note'],
                ]);
            }

            $draft?->delete();
        });
    }
}
