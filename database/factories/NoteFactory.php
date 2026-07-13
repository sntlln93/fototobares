<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Note;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'body' => fake()->sentence(),
        ];
    }
}
