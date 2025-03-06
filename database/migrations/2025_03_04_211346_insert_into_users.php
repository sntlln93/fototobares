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
        $created_at = new DateTime;

        $users = [
            [
                'id' => 1,
                'name' => 'Agustín Pérez',
                'email' => 'agustin@fototobares.com',
                'password' => Hash::make('contraseña'),
                'created_at' => $created_at,
            ],
            [
                'id' => 2,
                'name' => 'Matías Santillán',
                'email' => 'sntlln.93@gmail.com',
                'password' => Hash::make('contraseña'),
                'created_at' => $created_at,
            ],
            [
                'id' => 3,
                'name' => 'Gabriela Tobares',
                'email' => 'gabriela@fototobares.com',
                'password' => Hash::make('contraseña'),
                'created_at' => $created_at,
            ],
        ];

        foreach ($users as $user) {
            DB::insert('INSERT INTO users(id, name, email, password, created_at) VALUES (:id, :name, :email, :password, :created_at)', $user);
        }
    }
};
