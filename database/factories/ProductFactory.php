<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string
     *  mixed>
     */
    public function definition(): array
    {
        [$x, $y] = fake()->randomElements([10, 20, 30], 2);

        return [
            'name' => fake()->word(),
            'unit_price' => fake()->numberBetween(1, 9) * 1000,
            'max_payments' => fake()->numberBetween(1, 12),
            'type' => fake()->randomElement(['mural', 'taza', 'banda', 'medalla']),
            'variants' => [
                'photo_types' => fake()->randomElements(['grupo', 'individual'], fake()->numberBetween(1, 2)),
                'orientations' => fake()->randomElements(['vertical', 'horizontal'], fake()->numberBetween(1, 2)),
                'backgrounds' => fake()->randomElements(['white', 'black', 'blue', 'pink'], fake()->numberBetween(1, 4)),
                'colors' => fake()->randomElements(['white', 'black', 'blue', 'pink'], fake()->numberBetween(1, 4)),
                'dimentions' => "{$x}x{$y}",
            ],
        ];
    }
}
