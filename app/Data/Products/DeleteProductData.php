<?php

declare(strict_types=1);

namespace App\Data\Products;

use App\Contracts\DtoContract;
use App\Models\Product;

final readonly class DeleteProductData implements DtoContract
{
    public function __construct(
        public Product $product,
    ) {}
}
