<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<School>
 */
class SchoolFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Escuela '.fake()->unique()->company(),
            'level' => fake()->randomElement(['Jardín', 'Primaria', 'Secundaria']),
            'user_id' => User::factory(),
        ];
    }
}
