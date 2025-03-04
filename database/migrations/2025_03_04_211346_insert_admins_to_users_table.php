<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::insert('INSERT INTO users(name, email, password) VALUES (:name, :email, :password)', [
            'name' => 'Agustín Pérez',
            'email' => 'agustin@fototobares.com',
            'password' => Hash::make('contraseña'),
        ]);

        DB::insert('INSERT INTO users(name, email, password) VALUES (:name, :email, :password)', [
            'name' => 'Matías Santillán',
            'email' => 'sntlln.93@gmail.com',
            'password' => Hash::make('contraseña'),
        ]);
    }
};
