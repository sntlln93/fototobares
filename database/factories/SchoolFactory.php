<?php

namespace Database\Factories;

use App\Enums\ContactRole;
use App\Models\Address;
use App\Models\Classroom;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\School>
 */
class SchoolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->streetName(),
        ];
    }

    public function withClassRooms(): SchoolFactory
    {
        $howMany = fake()->numberBetween(1, 6);

        return $this->has(Classroom::factory($howMany)->withTeacher());
    }

    public function withPrincipal(): SchoolFactory
    {
        return $this->has(Contact::factory(['role' => ContactRole::Principal]), 'principal');
    }

    public function withAddress(): SchoolFactory
    {
        return $this->has(Address::factory());
    }
}
