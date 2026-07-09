<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * One user per role that the migrations don't cover yet
 * (master/administración already exist). Password: "contraseña".
 */
class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            'oficina' => 'Olga Oficina',
            'editor' => 'Elena Editora',
            'taller' => 'Tomás Taller',
        ];

        foreach ($users as $role => $name) {
            $user = User::create([
                'name' => $name,
                'email' => "$role@fototobares.com",
                'password' => Hash::make('contraseña'),
            ]);

            $user->roles()->attach(Role::where('name', $role)->firstOrFail());
        }
    }
}
