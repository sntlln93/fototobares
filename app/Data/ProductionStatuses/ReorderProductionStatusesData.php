<?php

declare(strict_types=1);

namespace App\Data\ProductionStatuses;

use App\Contracts\DtoContract;

final readonly class ReorderProductionStatusesData implements DtoContract
{
    /**
     * @param  list<int>  $orderedIds
     */
    public function __construct(
        public int $productId,
        public array $orderedIds,
    ) {}
}
