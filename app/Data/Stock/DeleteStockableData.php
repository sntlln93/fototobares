<?php

declare(strict_types=1);

namespace App\Data\Stock;

use App\Contracts\DtoContract;
use App\Models\Stockable;

final readonly class DeleteStockableData implements DtoContract
{
    public function __construct(
        public Stockable $stockable,
    ) {}
}
