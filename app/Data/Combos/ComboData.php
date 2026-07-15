<?php

declare(strict_types=1);

namespace App\Data\Combos;

use App\Contracts\DtoContract;

final readonly class ComboData implements DtoContract
{
    /**
     * @param  list<ComboProductData>  $products
     */
    public function __construct(
        public string $name,
        public float $suggestedPrice,
        public int $defaultPayments,
        public array $products,
    ) {}
}
