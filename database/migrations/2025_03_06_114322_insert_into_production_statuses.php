<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $statusesByType = [
            'mural' => ['Sin foto', 'Impreso', 'Pegado', 'Pintado', 'Laqueado', 'Embolsado'],
            'taza' => ['Pendiente', 'Impreso', 'Estampado', 'Embolsado'],
            'banda' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'medalla' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'carpeta' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'foto' => ['Pendiente', 'Impreso', 'Embolsado'],
            'portaretrato' => ['Pendiente', 'Impreso', 'Enmarcado', 'Embolsado'],
        ];

        foreach ($statusesByType as $type => $statuses) {
            $typeId = DB::table('product_types')->where('name', $type)->value('id');

            if ($typeId === null) {
                continue;
            }

            foreach ($statuses as $position => $status) {
                DB::insert(
                    'INSERT INTO production_statuses(product_type_id, name, position) VALUES (:product_type_id, :name, :position)',
                    [
                        'product_type_id' => $typeId,
                        'name' => $status,
                        'position' => $position + 1,
                    ]
                );
            }
        }
    }
};
