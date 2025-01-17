<?php

namespace Database\Factories;

use App\Enums\ContactRole;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomLetter(),
        ];
    }

    public function withTeacher(): ClassroomFactory
    {
        return $this->has(Contact::factory(['role' => ContactRole::Teacher]), 'teacher');
    }
}
