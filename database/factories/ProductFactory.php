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
            'has_photo' => false,
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
                ['label' => 'Tipo de foto', 'type' => 'text', 'nullable' => false, 'options' => [
                    ['label' => 'Individual'],
                    ['label' => 'Grupo'],
                ]],
                ['label' => 'Orientación', 'type' => 'text', 'nullable' => false, 'options' => [
                    ['label' => 'Vertical'],
                    ['label' => 'Horizontal'],
                ]],
                ['label' => 'Fondo', 'type' => 'color', 'nullable' => false, 'options' => [
                    ['label' => 'Celeste', 'color' => '#93c5fd'],
                    ['label' => 'Blanco', 'color' => '#ffffff'],
                ]],
                ['label' => 'Color', 'type' => 'color', 'nullable' => false, 'options' => [
                    ['label' => 'Marrón', 'color' => '#78350f'],
                    ['label' => 'Negro', 'color' => '#1c1917'],
                ]],
            ],
        ]);
    }

    public function banda(): static
    {
        return $this->state(fn () => [
            'name' => 'Banda '.fake()->unique()->word(),
            'unit_price' => 9000,
            'max_payments' => 1,
            'financed_price' => null,
            'product_type_id' => ProductType::where('name', 'banda')->firstOrFail()->id,
            'variants' => [
                ['label' => 'Talle', 'type' => 'text', 'nullable' => true, 'options' => [
                    ['label' => 'Único'],
                    ['label' => 'S'],
                    ['label' => 'M'],
                    ['label' => 'L'],
                ]],
            ],
        ]);
    }
}
