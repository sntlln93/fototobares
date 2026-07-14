<?php

declare(strict_types=1);

namespace App\Enums;

enum StockDirection: string
{
    case Subtract = 'subtract';
    case Add = 'add';
}
