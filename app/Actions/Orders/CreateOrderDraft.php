<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\AllocatePhotoNumberData;
use App\Data\Orders\CreateOrderDraftData;
use App\Models\OrderDraft;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<CreateOrderDraftData>
 */
class CreateOrderDraft implements ActionContract
{
    public function __construct(private readonly AllocatePhotoNumber $allocatePhotoNumber) {}

    /**
     * @param  CreateOrderDraftData  $params
     */
    public function handle(DtoContract $params): OrderDraft
    {
        return DB::transaction(function () use ($params) {
            $photoNumber = $params->attendedPhotoSession !== false
                ? $this->allocatePhotoNumber->handle(new AllocatePhotoNumberData($params->classroomId))
                : null;

            $attributes = [
                'classroom_id' => $params->classroomId,
                'child_name' => $params->childName,
                'client_name' => $params->clientName,
                'client_phone' => $params->clientPhone,
                'attended_photo_session' => $params->attendedPhotoSession,
                'due_date' => $params->dueDate,
                'products' => $params->products,
                'photo_number' => $photoNumber,
            ];

            // total_price/payment_plan are NOT NULL columns with DB defaults
            // (0/1): omit them, like the original raw-array spread did, so an
            // absent value keeps falling back to the column default instead
            // of violating the NOT NULL constraint.
            if ($params->totalPrice !== null) {
                $attributes['total_price'] = $params->totalPrice;
            }

            if ($params->paymentPlan !== null) {
                $attributes['payment_plan'] = $params->paymentPlan;
            }

            return OrderDraft::create($attributes);
        });
    }
}
