<?php

declare(strict_types=1);

namespace App\Data\Combos;

use App\Contracts\DtoContract;

final readonly class ComboProductData implements DtoContract
{
    /**
     * @param  array<string, mixed>|null  $variants
     */
    public function __construct(
        public int $id,
        public int $quantity,
        public int $subtractValue,
        public ?array $variants,
    ) {}
}
