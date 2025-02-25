<?php

namespace Database\Factories;

use App\Models\Combo;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Combo>
 */
class ComboFactory extends Factory
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
            'suggested_price' => fake()->numberBetween(100, 1000),
            'suggested_max_payments' => fake()->numberBetween(1, 12),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Combo $combo) {
            // Attach 1 to 3 random products to the combo
            $products = Product::inRandomOrder()->limit(rand(1, 3))->pluck('id');
            $combo->products()->attach($products);
        });
    }
}
