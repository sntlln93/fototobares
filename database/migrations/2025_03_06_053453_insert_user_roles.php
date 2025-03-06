<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $roles = [
            ['name' => 'master'],
            ['name' => 'administración'],
            ['name' => 'oficina'],
            ['name' => 'edición'],
            ['name' => 'taller'],
        ];

        foreach ($roles as $role) {
            DB::insert('INSERT INTO roles(name) VALUES (:name)', $role);
        }
    }
};
