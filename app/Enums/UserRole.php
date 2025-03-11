<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Master = 'master';
    case Admin = 'administración';
    case Office = 'oficina';
    case Editor = 'editor';
    case Worker = 'taller';
}
