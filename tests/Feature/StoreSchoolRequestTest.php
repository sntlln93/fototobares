<?php

declare(strict_types=1);

use App\Models\School;
use App\Models\User;

use function Pest\Laravel\post;

it('accepts a principal name without a phone', function () {
    actingAsRole();

    $user = User::factory()->create();

    post(route('schools.store'), [
        'school' => [
            'user_id' => $user->id,
            'name' => 'Escuela N°1',
            'level' => 'primary',
        ],
        'principal' => [
            'name' => 'María Pérez',
            'phone' => '',
        ],
        'address' => [
            'city' => 'Tobares',
        ],
    ])->assertSessionHasNoErrors();

    expect(School::where('name', 'Escuela N°1')->exists())->toBeTrue();
});

it('accepts a request without any principal data', function () {
    actingAsRole();

    $user = User::factory()->create();

    post(route('schools.store'), [
        'school' => [
            'user_id' => $user->id,
            'name' => 'Escuela N°2',
            'level' => 'primary',
        ],
        'address' => [
            'city' => 'Tobares',
        ],
    ])->assertSessionHasNoErrors();

    expect(School::where('name', 'Escuela N°2')->exists())->toBeTrue();
});

it('accepts a principal name with a valid numeric phone', function () {
    actingAsRole();

    $user = User::factory()->create();

    post(route('schools.store'), [
        'school' => [
            'user_id' => $user->id,
            'name' => 'Escuela N°3',
            'level' => 'primary',
        ],
        'principal' => [
            'name' => 'María Pérez',
            'phone' => '1234567890',
        ],
        'address' => [
            'city' => 'Tobares',
        ],
    ])->assertSessionHasNoErrors();

    expect(School::where('name', 'Escuela N°3')->exists())->toBeTrue();
});

it('rejects a non-numeric principal phone', function () {
    actingAsRole();

    $user = User::factory()->create();

    post(route('schools.store'), [
        'school' => [
            'user_id' => $user->id,
            'name' => 'Escuela N°4',
            'level' => 'primary',
        ],
        'principal' => [
            'name' => 'María Pérez',
            'phone' => 'abc',
        ],
        'address' => [
            'city' => 'Tobares',
        ],
    ])->assertSessionHasErrors('principal.phone');

    expect(School::where('name', 'Escuela N°4')->exists())->toBeFalse();
});
