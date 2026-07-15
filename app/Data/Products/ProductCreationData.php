<?php

declare(strict_types=1);

namespace App\Data\Products;

use App\Contracts\DtoContract;

final readonly class ProductCreationData implements DtoContract
{
    /**
     * @param  array<int, array{label: string, type: string, nullable: bool, options: array<int, array{label: string, color?: string|null}>}>|null  $variants
     */
    public function __construct(
        public string $name,
        public float $unitPrice,
        public int $maxPayments,
        public int $productTypeId,
        public ?array $variants,
    ) {}
}
