<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\OrderDraft;
use Illuminate\Support\Facades\DB;

class CreateOrderDraft implements ActionContract
{
    public function __construct(private readonly AllocatePhotoNumber $allocatePhotoNumber) {}

    /**
     * @param  array<string, mixed>  $params  validated draft payload
     */
    public function handle(array $params): OrderDraft
    {
        return DB::transaction(function () use ($params) {
            $attended = $params['attended_photo_session'] ?? null;

            $classroomId = is_numeric($params['classroom_id']) ? (int) $params['classroom_id'] : 0;

            $photoNumber = $attended !== false
                ? $this->allocatePhotoNumber->handle(['classroom_id' => $classroomId])
                : null;

            return OrderDraft::create([...$params, 'photo_number' => $photoNumber]);
        });
    }
}
