<?php

declare(strict_types=1);

namespace App\Data\ProductionStatuses;

use App\Contracts\DtoContract;
use App\Models\ProductionStatus;

final readonly class DeleteProductionStatusData implements DtoContract
{
    public function __construct(
        public ProductionStatus $status,
    ) {}
}
