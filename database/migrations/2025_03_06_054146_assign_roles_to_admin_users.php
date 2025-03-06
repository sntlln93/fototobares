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
            [
                'role_id' => 2, //administración
                'user_id' => 1, //agustin@fototobares.com
            ],
            [
                'role_id' => 1, //master
                'user_id' => 2, //sntlln.93@gmail.com
            ], [
                'role_id' => 2, //administración
                'user_id' => 3, //gabriela@fototobares.com
            ],
        ];

        foreach ($roles as $role) {
            DB::insert('INSERT INTO role_user(role_id, user_id) VALUES (:role_id, :user_id)', $role);
        }
    }
};
