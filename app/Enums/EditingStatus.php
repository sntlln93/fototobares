<?php

declare(strict_types=1);

namespace App\Enums;

enum EditingStatus: string
{
    case Pendiente = 'pendiente';
    case Editada = 'editada';
    case Ok = 'ok';
    case ACorregir = 'a_corregir';

    /**
     * Single source of truth for the editing-status transition matrix:
     * Pendiente -> Editada only for the assigned editor once production is
     * enabled; Editada -> {Ok, ACorregir} and Ok -> ACorregir only for a
     * manager; ACorregir -> Editada only for the assigned editor.
     *
     * @return list<self>
     */
    public static function allowedTargets(
        self $current,
        bool $isManager,
        bool $isAssignedEditor,
        bool $productionEnabled,
    ): array {
        return match ($current) {
            self::Pendiente => $isAssignedEditor && $productionEnabled ? [self::Editada] : [],
            self::Editada => $isManager ? [self::Ok, self::ACorregir] : [],
            self::Ok => $isManager ? [self::ACorregir] : [],
            self::ACorregir => $isAssignedEditor ? [self::Editada] : [],
        };
    }
}
