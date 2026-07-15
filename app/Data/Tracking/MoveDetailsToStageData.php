<?php

declare(strict_types=1);

namespace App\Data\Tracking;

use App\Contracts\DtoContract;
use App\Models\ProductionStatus;
use App\Models\User;

final readonly class MoveDetailsToStageData implements DtoContract
{
    /**
     * @param  list<int>  $detailIds
     */
    public function __construct(
        public array $detailIds,
        public ProductionStatus $status,
        public ?User $user,
    ) {}
}
