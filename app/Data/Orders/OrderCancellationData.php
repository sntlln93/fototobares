<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;
use App\Models\Order;
use App\Models\User;

final readonly class OrderCancellationData implements DtoContract
{
    /**
     * @param  list<DestinationData>  $destinations
     */
    public function __construct(
        public Order $order,
        public array $destinations,
        public ?User $user,
    ) {}
}
