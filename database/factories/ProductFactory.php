<?php

namespace Database\Factories;

use App\Data\VariantData;
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
            'unit_price' => fake()->numberBetween(1000, 10000),
            'max_payments' => fake()->numberBetween(1, 12),
            'variants' => [
                'photo_type' => fake()->randomElement(['grupo', 'individual']),
                'orientation' => fake()->randomElement(['vertical', 'horizontal']),
                'backgrounds' => fake()->randomElements(['white', 'black', 'green', 'blue'], 2),
                'colors' => fake()->randomElements(['white', 'black', 'green', 'blue'], 2),
                'dimensions' => "{$x}x{$y}",
            ],
        ];
    }
}
