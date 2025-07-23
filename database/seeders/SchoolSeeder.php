<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $school = School::create([
            'name' => 'Example School',
            'level' => 'Primary',
            'user_id' => 1,
        ]);

        $school->address()->create([
            'city' => 'La Rioja',
        ]);

        $school->classrooms()->create([
            'name' => 'Classroom A',
        ])->teacher()->create([
            'name' => 'Jane Smith',
            'phone' => '0987654321',
            'role' => 'Teacher',
        ]);

        $school->principal()->create([
            'name' => 'John Doe',
            'phone' => '1234567890',
            'role' => 'Principal',

        ]);
    }
}
