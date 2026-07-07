<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\OrderDraft;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderDraft>
 */
class OrderDraftFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'classroom_id' => Classroom::factory(),
            'child_name' => fake()->firstName(),
            'client_name' => fake()->name(),
            'client_phone' => '3804123456',
            'attended_photo_session' => true,
            'total_price' => 12000,
            'payment_plan' => 1,
            'due_date' => now()->addMonth()->format('Y-m-d'),
            'products' => [],
        ];
    }
}
