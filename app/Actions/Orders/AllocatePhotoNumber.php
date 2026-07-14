<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use App\Models\OrderDraft;

class AllocatePhotoNumber implements ActionContract
{
    /**
     * Next photo number for a classroom, drawn from a single sequence shared
     * between orders and drafts so a new order always counts existing drafts
     * (and vice versa) and never collides with them.
     *
     * @param  array{classroom_id: int}  $params
     */
    public function handle(array $params): int
    {
        $maxOrderNumber = Order::withTrashed()
            ->where('classroom_id', $params['classroom_id'])
            ->max('photo_number');

        $maxDraftNumber = OrderDraft::query()
            ->where('classroom_id', $params['classroom_id'])
            ->max('photo_number');

        $max = max(
            is_numeric($maxOrderNumber) ? (int) $maxOrderNumber : 0,
            is_numeric($maxDraftNumber) ? (int) $maxDraftNumber : 0,
        );

        return $max + 1;
    }
}
