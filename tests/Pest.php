<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\ProductionStatus;
use App\Models\ProductType;
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
 * Production status seeded by the migrations, by product type name and position.
 */
function statusFor(string $type, int $position): ProductionStatus
{
    return ProductionStatus::query()
        ->where('product_type_id', ProductType::where('name', $type)->firstOrFail()->id)
        ->where('position', $position)
        ->firstOrFail();
}
