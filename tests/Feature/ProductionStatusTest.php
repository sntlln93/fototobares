<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\ProductType;
use App\Models\Stockable;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('renders the stages grouped by product', function () {
    actingAsRole(UserRole::Admin);

    get(route('production-statuses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('production-statuses/index')
            ->has('products', 12)
            ->has('stockables')
            ->where('products.0.name', 'Clásico')
            ->where('products.0.statuses.0.name', 'Sin foto')
            ->where('products.0.statuses.0.details_count', 0));
});

it('appends a new stage at the end of the chain', function () {
    actingAsRole(UserRole::Admin);

    $clasico = Product::where('name', 'Clásico')->firstOrFail();

    post(route('production-statuses.store'), [
        'product_id' => $clasico->id,
        'name' => 'Control de calidad',
    ])->assertSessionHasNoErrors();

    $status = ProductionStatus::where('name', 'Control de calidad')->firstOrFail();

    expect($status->product_id)->toBe($clasico->id)
        ->and($status->position)->toBe(7);
});

it('rejects a duplicated stage name within the same product', function () {
    actingAsRole(UserRole::Admin);

    post(route('production-statuses.store'), [
        'product_id' => Product::where('name', 'Clásico')->firstOrFail()->id,
        'name' => 'Impreso',
    ])->assertSessionHasErrors('name');
});

it('allows reusing a stage name on a different product', function () {
    actingAsRole(UserRole::Admin);

    post(route('production-statuses.store'), [
        'product_id' => Product::where('name', 'Taza')->firstOrFail()->id,
        'name' => 'Sin foto',
    ])->assertSessionHasNoErrors();
});

it('renames a stage', function () {
    actingAsRole(UserRole::Admin);

    put(route('production-statuses.update', statusFor('Clásico', 1)), [
        'name' => 'Sin fotografía',
    ])->assertSessionHasNoErrors();

    expect(statusFor('Clásico', 1)->name)->toBe('Sin fotografía');
});

it('deletes an unused stage and compacts the positions', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 2);

    delete(route('production-statuses.destroy', $status))
        ->assertSessionHasNoErrors();

    $positions = ProductionStatus::query()
        ->where('product_id', $status->product_id)
        ->orderBy('position')
        ->pluck('position')
        ->all();

    expect($positions)->toBe([1, 2, 3, 4, 5])
        ->and(statusFor('Clásico', 2)->name)->toBe('Pegado');
});

it('refuses to delete a stage with products in it', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 2);

    OrderDetail::factory()->create([
        'product_id' => $status->product_id,
        'production_status_id' => $status->id,
    ]);

    delete(route('production-statuses.destroy', $status))
        ->assertSessionHasErrors('status');

    expect(ProductionStatus::whereKey($status->id)->exists())->toBeTrue();
});

it('refuses to delete a stage that consumes stockables', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 3);
    $status->stockables()->attach(Stockable::factory()->create()->id, ['quantity' => -2]);

    delete(route('production-statuses.destroy', $status))
        ->assertSessionHasErrors('status');

    expect(ProductionStatus::whereKey($status->id)->exists())->toBeTrue();
});

it('refuses to delete the only stage of a product', function () {
    actingAsRole(UserRole::Admin);

    $product = productWithChain(['Terminado']);

    delete(route('production-statuses.destroy', stageOf($product, 1)))
        ->assertSessionHasErrors('status');
});

it('reorders the stages of a product', function () {
    actingAsRole(UserRole::Admin);

    $clasico = Product::where('name', 'Clásico')->firstOrFail();

    $orderedIds = ProductionStatus::query()
        ->where('product_id', $clasico->id)
        ->orderBy('position')
        ->pluck('id')
        ->reverse()
        ->values()
        ->all();

    put(route('production-statuses.reorder'), [
        'product_id' => $clasico->id,
        'ordered_ids' => $orderedIds,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(statusFor('Clásico', 1)->name)->toBe('Embolsado')
        ->and(statusFor('Clásico', 6)->name)->toBe('Sin foto');
});

it('rejects a reorder that does not include every stage of the product', function () {
    actingAsRole(UserRole::Admin);

    put(route('production-statuses.reorder'), [
        'product_id' => Product::where('name', 'Clásico')->firstOrFail()->id,
        'ordered_ids' => [statusFor('Clásico', 1)->id],
    ])->assertSessionHasErrors('ordered_ids');
});

it('hangs a stockable consumption from a stage and updates its quantity', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 3);
    $stockable = Stockable::factory()->create();

    post(route('production-statuses.stockables.store', $status), [
        'stockable_id' => $stockable->id,
        'quantity' => 2,
        'direction' => 'subtract',
    ])->assertSessionHasNoErrors();

    expect($status->stockables()->count())->toBe(1)
        ->and((int) $status->stockables()->first()?->pivot->quantity)->toBe(-2);

    // Posting again updates the quantity in place
    post(route('production-statuses.stockables.store', $status), [
        'stockable_id' => $stockable->id,
        'quantity' => 5,
        'direction' => 'subtract',
    ])->assertSessionHasNoErrors();

    expect($status->stockables()->count())->toBe(1)
        ->and((int) $status->stockables()->first()?->pivot->quantity)->toBe(-5);
});

it('hangs a stockable production from a stage with a positive pivot', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 3);
    $stockable = Stockable::factory()->create();

    post(route('production-statuses.stockables.store', $status), [
        'stockable_id' => $stockable->id,
        'quantity' => 1,
        'direction' => 'add',
    ])->assertSessionHasNoErrors();

    expect((int) $status->stockables()->first()?->pivot->quantity)->toBe(1);
});

it('rejects a zero quantity or a missing direction', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 3);
    $stockable = Stockable::factory()->create();

    post(route('production-statuses.stockables.store', $status), [
        'stockable_id' => $stockable->id,
        'quantity' => 0,
        'direction' => 'subtract',
    ])->assertSessionHasErrors('quantity');

    post(route('production-statuses.stockables.store', $status), [
        'stockable_id' => $stockable->id,
        'quantity' => 1,
    ])->assertSessionHasErrors('direction');
});

it('allows the same stockable on two stages of one product', function () {
    actingAsRole(UserRole::Admin);

    $stockable = Stockable::factory()->create();
    statusFor('Clásico', 3)->stockables()->attach($stockable->id, ['quantity' => 1]);

    post(route('production-statuses.stockables.store', statusFor('Clásico', 6)), [
        'stockable_id' => $stockable->id,
        'quantity' => 1,
        'direction' => 'subtract',
    ])->assertSessionHasNoErrors();
});

it('allows consuming the same stockable on stages of different products', function () {
    actingAsRole(UserRole::Admin);

    $stockable = Stockable::factory()->create();
    statusFor('Clásico', 6)->stockables()->attach($stockable->id, ['quantity' => 1]);

    post(route('production-statuses.stockables.store', statusFor('Taza', 4)), [
        'stockable_id' => $stockable->id,
        'quantity' => 1,
        'direction' => 'subtract',
    ])->assertSessionHasNoErrors();
});

it('detaches a stockable consumption from a stage', function () {
    actingAsRole(UserRole::Admin);

    $status = statusFor('Clásico', 3);
    $stockable = Stockable::factory()->create();
    $status->stockables()->attach($stockable->id, ['quantity' => 1]);

    delete(route('production-statuses.stockables.destroy', [$status, $stockable]))
        ->assertSessionHasNoErrors();

    expect($status->stockables()->count())->toBe(0);
});

it('creates new products with a single final stage', function () {
    actingAsRole(UserRole::Admin);

    post(route('products.store'), [
        'name' => 'Llaveros',
        'unit_price' => 5000,
        'max_payments' => 1,
        'product_type_id' => ProductType::where('name', 'foto')->firstOrFail()->id,
    ])->assertSessionHasNoErrors();

    $product = Product::where('name', 'Llaveros')->firstOrFail();

    expect($product->productionStatuses()->count())->toBe(1)
        ->and(stageOf($product, 1)->name)->toBe('Terminado');
});
