<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;
use App\Models\Order;

final readonly class UpdateDetailVariantData implements DtoContract
{
    /**
     * @param  array<string, string|null>  $variant
     */
    public function __construct(
        public Order $order,
        public int $detailId,
        public array $variant,
    ) {}
}
