<?php

declare(strict_types=1);

namespace App\Data\Deliveries;

use App\Contracts\DtoContract;
use App\Models\Order;

final readonly class MarkDeliveriesData implements DtoContract
{
    /**
     * @param  list<int>  $detailIds
     */
    public function __construct(
        public Order $order,
        public array $detailIds,
        public string $action,
    ) {}
}
