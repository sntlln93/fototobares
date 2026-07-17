<?php

declare(strict_types=1);

namespace App\Data\EditingStatus;

use App\Contracts\DtoContract;

final readonly class RevertEditingStatusData implements DtoContract
{
    public function __construct(
        public int $orderDetailId,
        public int $revertedById,
    ) {}
}
