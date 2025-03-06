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
        $created_at = new DateTime;

        $roles = [
            [
                'role_id' => 2, //administración
                'user_id' => 1, //agustin@fototobares.com
                'created_at' => $created_at,
            ],
            [
                'role_id' => 1, //master
                'user_id' => 2, //sntlln.93@gmail.com
                'created_at' => $created_at,
            ], [
                'role_id' => 2, //administración
                'user_id' => 3, //gabriela@fototobares.com
                'created_at' => $created_at,
            ],
        ];

        foreach ($roles as $role) {
            DB::insert('INSERT INTO role_user(role_id, user_id, created_at) VALUES (:role_id, :user_id, :created_at)', $role);
        }
    }
};
