<?php

declare(strict_types=1);

namespace App\Data\ProductionStatuses;

use App\Contracts\DtoContract;

final readonly class CreateProductionStatusData implements DtoContract
{
    public function __construct(
        public int $productId,
        public string $name,
    ) {}
}
