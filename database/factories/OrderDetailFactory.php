<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderDetail>
 */
class OrderDetailFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'variant' => [],
            'note' => fake()->sentence(3),
        ];
    }

    public function delivered(): static
    {
        return $this->state(fn () => ['delivered_at' => now()]);
    }

    /**
     * Production enabled: the first installment was paid and the office
     * let the detail into the workshop board.
     */
    public function enabled(): static
    {
        return $this->state(fn () => ['production_enabled_at' => now()]);
    }

    public function recycled(string $destination = 'reciclaje'): static
    {
        return $this->state(fn () => ['recycled_to' => $destination]);
    }
}
