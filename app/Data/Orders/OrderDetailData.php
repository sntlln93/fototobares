<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

final readonly class OrderDetailData implements DtoContract
{
    /**
     * @param  array<string, string|null>|null  $variant
     */
    public function __construct(
        public ?int $id,
        public int $productId,
        public ?string $note,
        public ?array $variant,
    ) {}
}
