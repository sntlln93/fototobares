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
        $created_at = new DateTime;

        $roles = [
            ['name' => 'master', 'created_at' => $created_at],
            ['name' => 'administración', 'created_at' => $created_at],
            ['name' => 'oficina', 'created_at' => $created_at],
            ['name' => 'edición', 'created_at' => $created_at],
            ['name' => 'taller', 'created_at' => $created_at],
        ];

        foreach ($roles as $role) {
            DB::insert('INSERT INTO roles(name, created_at) VALUES (:name, :created_at)', $role);
        }
    }
};
