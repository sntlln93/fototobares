<?php

declare(strict_types=1);

namespace App\Data\Combos;

use App\Contracts\DtoContract;
use App\Models\Combo;

final readonly class DeleteComboData implements DtoContract
{
    public function __construct(
        public Combo $combo,
    ) {}
}
