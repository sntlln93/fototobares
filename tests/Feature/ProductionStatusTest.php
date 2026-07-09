<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\ProductType;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('renders the stages grouped by product type', function () {
    actingAsRole(UserRole::Admin);

    get(route('production-statuses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('production-statuses/index')
            ->has('productTypes', 7)
            ->where('productTypes.0.name', 'mural')
            ->where('productTypes.0.statuses.0.name', 'Sin foto')
            ->where('productTypes.0.statuses.0.details_count', 0));
});

it('appends a new stage at the end of the chain', function () {
    actingAsRole(UserRole::Admin);

    $mural = ProductType::where('name', 'mural')->firstOrFail();

    post(route('production-statuses.store'), [
        'product_type_id' => $mural->id,
        'name' => 'Control de calidad',
    ])->assertSessionHasNoErrors();

    $status = ProductionStatus::where('name', 'Control de calidad')->firstOrFail();

    expect($status->product_type_id)->toBe($mural->id)
        ->and($status->position)->toBe(7);
});

it('rejects a duplicated stage name within the same type', function () {
    actingAsRole(UserRole::Admin);

    $mural = ProductType::where('name', 'mural')->firstOrFail();

    post(route('production-statuses.store'), [
        'product_type_id' => $mural->id,
        'name' => 'Impreso',
    ])->assertSessionHasErrors('name');
});

it('allows reusing a stage name on a different type', function () {
    actingAsRole(UserRole::Admin);

    $taza = ProductType::where('name', 'taza')->firstOrFail();

    post(route('production-statuses.store'), [
        'product_type_id' => $taza->id,
        'name' => 'Sin foto',
    ])->assertSessionHasNoErrors();
});

it('renames a stage', function () {
    actingAsRole(UserRole::Admin);

    put(route('production-statuses.update', statusFor('mural', 1)), [
        'name' => 'Sin fotografía',
    ])->assertSessionHasNoErrors();

    expect(statusFor('mural', 1)->name)->toBe('Sin fotografía');
});

it('deletes an unused stage and compacts the positions', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('mural', 2);

    delete(route('production-statuses.destroy', $status))
        ->assertSessionHasNoErrors();

    $positions = ProductionStatus::query()
        ->where('product_type_id', $status->product_type_id)
        ->orderBy('position')
        ->pluck('position')
        ->all();

    expect($positions)->toBe([1, 2, 3, 4, 5])
        ->and(statusFor('mural', 2)->name)->toBe('Pegado');
});

it('refuses to delete a stage with products in it', function () {
    actingAsRole(UserRole::Admin);

    $product = Product::factory()->mural()->create();
    $status = statusFor('mural', 2);

    OrderDetail::factory()->create([
        'product_id' => $product->id,
        'production_status_id' => $status->id,
    ]);

    delete(route('production-statuses.destroy', $status))
        ->assertSessionHasErrors('status');

    expect(ProductionStatus::whereKey($status->id)->exists())->toBeTrue();
});

it('refuses to delete the only stage of a type', function () {
    actingAsRole(UserRole::Admin);

    delete(route('production-statuses.destroy', statusFor('foto', 3)))
        ->assertSessionHasNoErrors();
    delete(route('production-statuses.destroy', statusFor('foto', 2)))
        ->assertSessionHasNoErrors();

    delete(route('production-statuses.destroy', statusFor('foto', 1)))
        ->assertSessionHasErrors('status');
});

it('reorders the stages of a type', function () {
    actingAsRole(UserRole::Admin);

    $mural = ProductType::where('name', 'mural')->firstOrFail();

    $orderedIds = ProductionStatus::query()
        ->where('product_type_id', $mural->id)
        ->orderBy('position')
        ->pluck('id')
        ->reverse()
        ->values()
        ->all();

    put(route('production-statuses.reorder'), [
        'product_type_id' => $mural->id,
        'ordered_ids' => $orderedIds,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(statusFor('mural', 1)->name)->toBe('Embolsado')
        ->and(statusFor('mural', 6)->name)->toBe('Sin foto');
});

it('rejects a reorder that does not include every stage of the type', function () {
    actingAsRole(UserRole::Admin);

    $mural = ProductType::where('name', 'mural')->firstOrFail();

    put(route('production-statuses.reorder'), [
        'product_type_id' => $mural->id,
        'ordered_ids' => [statusFor('mural', 1)->id],
    ])->assertSessionHasErrors('ordered_ids');
});
