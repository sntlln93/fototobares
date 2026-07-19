<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Classroom;

use function Pest\Laravel\get;

it('enforces route access by role', function (UserRole $role, string $routeName, int $status) {
    actingAsRole($role);

    get(route($routeName))->assertStatus($status);
})->with([
    // master: acceso total
    'master ve pedidos' => [UserRole::Master, 'orders.index', 200],
    'master ve seguimiento' => [UserRole::Master, 'tracking.index', 200],
    'master ve usuarios' => [UserRole::Master, 'users.index', 200],
    'master ve etapas' => [UserRole::Master, 'production-statuses.index', 200],
    'master ve stickers' => [UserRole::Master, 'stickers.index', 200],

    // administración: todo el día a día, sin gestión de usuarios
    'administración ve pedidos' => [UserRole::Admin, 'orders.index', 200],
    'administración ve seguimiento' => [UserRole::Admin, 'tracking.index', 200],
    'administración ve etapas' => [UserRole::Admin, 'production-statuses.index', 200],
    'administración no ve usuarios' => [UserRole::Admin, 'users.index', 403],
    'administración ve stickers' => [UserRole::Admin, 'stickers.index', 200],

    // oficina: como administración, sin configuración de etapas
    'oficina ve pedidos' => [UserRole::Office, 'orders.index', 200],
    'oficina ve stock' => [UserRole::Office, 'stockables.index', 200],
    'oficina no ve etapas' => [UserRole::Office, 'production-statuses.index', 403],
    'oficina no ve usuarios' => [UserRole::Office, 'users.index', 403],
    'oficina ve stickers' => [UserRole::Office, 'stickers.index', 200],

    // taller: solo producción y stock
    'taller no ve pedidos' => [UserRole::Worker, 'orders.index', 403],
    'taller no ve escuelas' => [UserRole::Worker, 'schools.index', 403],
    'taller ve seguimiento' => [UserRole::Worker, 'tracking.index', 200],
    'taller ve stock' => [UserRole::Worker, 'stockables.index', 200],
    'taller ve movimientos' => [UserRole::Worker, 'stock-movements.index', 200],
    'taller ve reciclaje' => [UserRole::Worker, 'recycling.index', 200],
    'taller no ve etapas' => [UserRole::Worker, 'production-statuses.index', 403],
    'taller no ve usuarios' => [UserRole::Worker, 'users.index', 403],
    'taller no ve stickers' => [UserRole::Worker, 'stickers.index', 403],

    // editor: solo fotos (se prueba aparte, requiere un curso)
    'editor no ve pedidos' => [UserRole::Editor, 'orders.index', 403],
    'editor no ve seguimiento' => [UserRole::Editor, 'tracking.index', 403],
    'editor no ve stickers' => [UserRole::Editor, 'stickers.index', 403],
]);

it('allows the editor role to manage classroom photos', function () {
    actingAsRole(UserRole::Editor);

    $classroom = Classroom::factory()->create();

    get(route('photos.index', $classroom))->assertOk();
});

it('redirects guests to the login page', function () {
    get(route('orders.index'))->assertRedirect(route('login'));
});
