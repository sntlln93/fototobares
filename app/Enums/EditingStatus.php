<?php

declare(strict_types=1);

namespace App\Enums;

enum EditingStatus: string
{
    case Pendiente = 'pendiente';
    case Editada = 'editada';
    case Ok = 'ok';
    case ACorregir = 'a_corregir';
}
