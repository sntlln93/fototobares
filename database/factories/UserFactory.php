<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('contraseña'),
        ];
    }

    /**
     * Attach one of the roles seeded by the migrations.
     */
    public function withRole(UserRole $role): static
    {
        return $this->afterCreating(function (User $user) use ($role) {
            $user->roles()->attach(
                Role::where('name', $role->value)->firstOrFail()->id,
            );
        });
    }
}
