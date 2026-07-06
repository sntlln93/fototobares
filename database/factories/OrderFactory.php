<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'classroom_id' => Classroom::factory(),
            'total_price' => 64000,
            'payment_plan' => 4,
            'due_date' => now()->addMonth()->format('Y-m-d'),
            'child_name' => fake()->firstName(),
            'attended_photo_session' => true,
            'photo_number' => null,
        ];
    }

    public function overdue(): static
    {
        return $this->state(fn () => [
            'due_date' => now()->subDays(10)->format('Y-m-d'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'cancelled_at' => now(),
        ]);
    }
}
