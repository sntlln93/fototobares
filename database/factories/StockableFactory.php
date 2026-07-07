<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Stockable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stockable>
 */
class StockableFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Insumo '.fake()->unique()->word(),
            'quantity' => 10,
            'unit' => 'Unidad',
            'alert_at' => 5,
        ];
    }
}
