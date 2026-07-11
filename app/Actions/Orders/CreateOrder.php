<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use Illuminate\Support\Facades\DB;

class CreateOrder implements ActionContract
{
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

            // Photos are numbered by classroom following the order in which
            // orders are taken: assign the next photo number automatically,
            // unless the child did not attend the photo session.
            $photoNumber = null;

            if ($attended !== false) {
                $maxPhotoNumber = Order::withTrashed()
                    ->where('classroom_id', $params['classroom_id'])
                    ->max('photo_number');

                $photoNumber = (is_numeric($maxPhotoNumber) ? (int) $maxPhotoNumber : 0) + 1;
            }

            $order = Order::create([
                'client_id' => $client->id,
                'classroom_id' => $params['classroom_id'],
                'total_price' => $params['total_price'],
                'payment_plan' => $params['payment_plan'],
                'due_date' => $params['due_date'],
                'child_name' => $params['child_name'] ?? null,
                'attended_photo_session' => $attended,
                'photo_number' => $photoNumber,
            ]);

            /** @var array<int, array<string, mixed>> $orderDetails */
            $orderDetails = $params['order_details'];

            foreach ($orderDetails as $product) {
                $order->products()->attach($product['product_id'], [
                    'variant' => $product['variant'] ?? [],
                    'note' => $product['note'],
                ]);
            }

            if (isset($params['draft_id'])) {
                OrderDraft::query()->whereKey($params['draft_id'])->delete();
            }
        });
    }
}
