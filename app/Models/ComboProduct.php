<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ComboProduct extends Pivot
{
    protected $casts = [
        'variants' => 'array',
    ];
}
