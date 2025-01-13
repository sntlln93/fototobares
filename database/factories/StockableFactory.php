<?php

namespace Database\Factories;

use App\Enums\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stockable>
 */
class StockableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'quantity' => fake()->numberBetween(0, 100),
            'unit' => Arr::random(Unit::cases()),
            'alert_at' => fake()->numberBetween(10, 50),
        ];
    }
}
