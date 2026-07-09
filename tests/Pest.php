<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)
    ->beforeEach(function () {
        $this->withoutVite();

        // Pages live in js/pages (lowercase); Inertia's default is js/Pages,
        // which case-sensitive filesystems (CI) fail to find
        config()->set('inertia.testing.page_paths', [resource_path('js/pages')]);
    })
    ->in('Feature');

/**
 * Create a user with one of the migration-seeded roles and act as them.
 */
function actingAsRole(UserRole $role = UserRole::Admin): User
{
    $user = User::factory()->withRole($role)->create();

    test()->actingAs($user);

    return $user;
}

/**
 * Production status seeded by the migrations, by product name and position.
 */
function statusFor(string $productName, int $position): ProductionStatus
{
    return ProductionStatus::query()
        ->where('product_id', Product::where('name', $productName)->firstOrFail()->id)
        ->where('position', $position)
        ->firstOrFail();
}

/**
 * Create a factory product owning a production chain with the given
 * stage names.
 *
 * @param  array<int, string>  $stages
 */
function productWithChain(array $stages = ['Pendiente', 'Impreso', 'Embolsado'], ?Product $product = null): Product
{
    $product ??= Product::factory()->create();

    foreach ($stages as $position => $name) {
        ProductionStatus::create([
            'product_id' => $product->id,
            'name' => $name,
            'position' => $position + 1,
        ]);
    }

    return $product;
}

/**
 * Stage of a product's chain, by position.
 */
function stageOf(Product $product, int $position): ProductionStatus
{
    return ProductionStatus::query()
        ->where('product_id', $product->id)
        ->where('position', $position)
        ->firstOrFail();
}
