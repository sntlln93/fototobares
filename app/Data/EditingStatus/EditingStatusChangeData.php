<?php

declare(strict_types=1);

namespace App\Data\EditingStatus;

use App\Contracts\DtoContract;
use App\Enums\EditingStatus;

final readonly class EditingStatusChangeData implements DtoContract
{
    public function __construct(
        public int $orderDetailId,
        public EditingStatus $target,
        public int $changedById,
    ) {}
}
