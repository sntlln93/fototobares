<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\DetailVariantSnapshotData;
use App\Data\Orders\OrderData;
use App\Data\Orders\PhotoNumberAllocationData;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<OrderData>
 */
class CreateOrderAction implements ActionContract
{
    public function __construct(
        private readonly AllocatePhotoNumberAction $allocatePhotoNumber,
        private readonly SnapshotDetailVariantAction $snapshotDetailVariant,
    ) {}

    /**
     * Create an order with its client and product details, auto-assigning the
     * classroom photo number, and consume the source draft when present.
     *
     * @param  OrderData  $params
     */
    public function handle(DtoContract $params): void
    {
        DB::transaction(function () use ($params) {
            $client = Client::create([
                'name' => $params->name,
                'phone' => $params->phone,
            ]);

            $attended = $params->attendedPhotoSession;

            $classroomId = $params->classroomId;

            $draft = $params->draftId !== null
                ? OrderDraft::find($params->draftId)
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
                    : $this->allocatePhotoNumber->handle(new PhotoNumberAllocationData($classroomId));
            }

            $order = Order::create([
                'client_id' => $client->id,
                'classroom_id' => $classroomId,
                'total_price' => $params->totalPrice,
                'payment_plan' => $params->paymentPlan,
                'due_date' => $params->dueDate,
                'child_name' => $params->childName,
                'attended_photo_session' => $attended,
                'photo_number' => $photoNumber,
            ]);

            $orderDetails = $params->orderDetails;

            $products = Product::whereIn('id', collect($orderDetails)->pluck('productId'))
                ->get(['id', 'variants'])
                ->keyBy('id');

            foreach ($orderDetails as $detail) {
                $productModel = $products->get($detail->productId);

                $order->products()->attach($detail->productId, [
                    'variant' => $this->snapshotDetailVariant->handle(new DetailVariantSnapshotData(
                        definitions: $productModel->variants ?? [],
                        selection: $detail->variant ?? [],
                    )),
                    'note' => $detail->note,
                ]);
            }

            $draft?->delete();
        });
    }
}
