<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;
use App\Models\Order;
use App\Models\User;

final readonly class SetDetailProductionStatusData implements DtoContract
{
    public function __construct(
        public Order $order,
        public int $detailId,
        public ?int $statusId,
        public ?User $user,
    ) {}
}
