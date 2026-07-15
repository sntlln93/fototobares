<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

final readonly class SnapshotDetailVariantData implements DtoContract
{
    /**
     * @param  array<int, array{label: string, type: string, nullable: bool, options: array<int, array{label: string, color?: string|null}>}>  $definitions
     * @param  array<string, string|null>  $selection
     */
    public function __construct(
        public array $definitions,
        public array $selection,
    ) {}
}
