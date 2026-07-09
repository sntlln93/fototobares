<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Three schools (one per level) with classrooms, teachers, principals
 * and addresses.
 */
class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        $master = User::where('email', 'sntlln.93@gmail.com')->firstOrFail();

        $normal = School::create([
            'name' => 'Escuela Normal',
            'level' => 'Primaria',
            'user_id' => $master->id,
        ]);
        $normal->address()->create(['city' => 'La Rioja', 'street' => 'Av. Rivadavia', 'number' => '742']);
        $normal->principal()->create(['name' => 'Norma Herrera', 'phone' => '3804111111', 'role' => 'Principal']);
        $normal->classrooms()->create(['name' => '6to A'])
            ->teacher()->create(['name' => 'Sofía Ramírez', 'phone' => '3804222222', 'role' => 'Teacher']);
        $normal->classrooms()->create(['name' => '6to B'])
            ->teacher()->create(['name' => 'Carla Núñez', 'phone' => '3804333333', 'role' => 'Teacher']);

        $jardin = School::create([
            'name' => 'Jardín Arcoíris',
            'level' => 'Jardín',
            'user_id' => $master->id,
        ]);
        $jardin->address()->create(['city' => 'La Rioja', 'street' => 'San Martín', 'number' => '1200']);
        $jardin->principal()->create(['name' => 'Patricia Ávila', 'phone' => '3804444444', 'role' => 'Principal']);
        $jardin->classrooms()->create(['name' => 'Sala de 5'])
            ->teacher()->create(['name' => 'Marta López', 'phone' => '3804555555', 'role' => 'Teacher']);

        $secundaria = School::create([
            'name' => 'Colegio San Nicolás',
            'level' => 'Secundaria',
            'user_id' => $master->id,
        ]);
        $secundaria->address()->create(['city' => 'La Rioja', 'street' => 'Belgrano', 'number' => '450']);
        $secundaria->principal()->create(['name' => 'Ricardo Peralta', 'phone' => '3804666666', 'role' => 'Principal']);
        $secundaria->classrooms()->create(['name' => '5to Humanidades'])
            ->teacher()->create(['name' => 'Lucía Moreno', 'phone' => '3804777777', 'role' => 'Teacher']);
    }
}
