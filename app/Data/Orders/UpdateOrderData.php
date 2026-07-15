<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;
use App\Models\Order;

final readonly class UpdateOrderData implements DtoContract
{
    public function __construct(
        public Order $order,
        public OrderData $data,
    ) {}
}
