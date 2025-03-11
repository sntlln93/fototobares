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
        $types = ['mural', 'taza', 'banda', 'medalla', 'carpeta', 'foto', 'portaretrato'];

        foreach ($types as $type) {
            DB::insert('INSERT INTO product_types(name) VALUES(:name)', [
                'name' => $type,
            ]);
        }
    }
};
