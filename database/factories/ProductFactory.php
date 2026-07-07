<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Product types are inserted by the migrations, so factories look them
 * up by name instead of creating them.
 *
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Producto '.fake()->unique()->word(),
            'unit_price' => 12000,
            'max_payments' => 1,
            'financed_price' => null,
            'product_type_id' => fn () => ProductType::where('name', 'taza')->firstOrFail()->id,
        ];
    }

    public function ofType(string $type): static
    {
        return $this->state(fn () => [
            'product_type_id' => ProductType::where('name', $type)->firstOrFail()->id,
        ]);
    }

    public function mural(): static
    {
        return $this->state(fn () => [
            'name' => 'Mural '.fake()->unique()->word(),
            'unit_price' => 48000,
            'max_payments' => 4,
            'financed_price' => 52000,
            'product_type_id' => ProductType::where('name', 'mural')->firstOrFail()->id,
            'variants' => [
                'photo_types' => ['individual', 'grupo'],
                'orientations' => ['vertical', 'horizontal'],
                'backgrounds' => ['blue', 'white'],
                'colors' => ['brown', 'black'],
                'dimentions' => '30x40',
            ],
        ]);
    }
}
