<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\UpdateOrderClientData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<UpdateOrderClientData>
 */
class UpdateOrderClient implements ActionContract
{
    /**
     * Update an order's client data and attended_photo_session flag.
     *
     * @param  UpdateOrderClientData  $params
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;

        DB::transaction(function () use ($order, $params) {
            $order->update([
                'child_name' => $params->childName,
                'attended_photo_session' => $params->attendedPhotoSession,
            ]);

            $order->client()->update([
                'name' => $params->name,
                'phone' => $params->phone,
            ]);
        });
    }
}
