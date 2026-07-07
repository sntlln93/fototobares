<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\School;
use App\Models\User;

use function Pest\Laravel\delete;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('creates a user with roles', function () {
    actingAsRole(UserRole::Master);

    $roleId = Role::where('name', UserRole::Worker->value)->firstOrFail()->id;

    post(route('users.store'), [
        'name' => 'Nuevo Tallerista',
        'email' => 'nuevo@fototobares.com',
        'password' => 'contraseña segura',
        'roles' => [$roleId],
    ])->assertSessionHasNoErrors();

    $user = User::where('email', 'nuevo@fototobares.com')->first();

    expect($user)->not->toBeNull()
        ->and($user?->roleNames())->toBe([UserRole::Worker->value]);
});

it('keeps the password when updating without one', function () {
    actingAsRole(UserRole::Master);

    $user = User::factory()->withRole(UserRole::Worker)->create();
    $originalHash = $user->password;

    put(route('users.update', $user), [
        'name' => 'Renombrado',
        'email' => $user->email,
        'password' => '',
        'roles' => [Role::where('name', UserRole::Worker->value)->firstOrFail()->id],
    ])->assertSessionHasNoErrors();

    $user->refresh();

    expect($user->name)->toBe('Renombrado')
        ->and($user->password)->toBe($originalHash);
});

it('prevents deleting your own user', function () {
    $me = actingAsRole(UserRole::Master);

    delete(route('users.destroy', $me))->assertSessionHasErrors('user');

    expect(User::find($me->id))->not->toBeNull();
});

it('prevents deleting a user in charge of a school', function () {
    actingAsRole(UserRole::Master);

    $manager = User::factory()->create();
    School::factory()->create(['user_id' => $manager->id]);

    delete(route('users.destroy', $manager))->assertSessionHasErrors('user');

    expect(User::find($manager->id))->not->toBeNull();
});

it('deletes a regular user', function () {
    actingAsRole(UserRole::Master);

    $user = User::factory()->withRole(UserRole::Worker)->create();

    delete(route('users.destroy', $user))->assertSessionHasNoErrors();

    expect(User::find($user->id))->toBeNull();
});
