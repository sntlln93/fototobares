<?php

declare(strict_types=1);

use App\Enums\EditingStatus;
use App\Enums\UserRole;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;
use App\Models\OrderEditingStatusChange;
use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

/**
 * Seed a current editing status by writing a history row directly.
 */
function seedEditingStatus(OrderDetail $detail, EditingStatus $status, User $changedBy): OrderEditingStatusChange
{
    return OrderEditingStatusChange::create([
        'order_detail_id' => $detail->id,
        'status' => $status,
        'changed_by' => $changedBy->id,
        'changed_at' => now(),
    ]);
}

// pendiente -> editada

it('lets the assigned editor move a detail from pendiente to editada', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    actingAs($editor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasNoErrors();

    $changes = OrderEditingStatusChange::where('order_detail_id', $detail->id)->get();

    expect($changes)->toHaveCount(1)
        ->and($changes->first()->status)->toBe(EditingStatus::Editada)
        ->and($changes->first()->changed_by)->toBe($editor->id);
});

it('rejects pendiente to editada by an editor not assigned to the detail', function () {
    $assignedEditor = User::factory()->withRole(UserRole::Editor)->create();
    $otherEditor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $assignedEditor->id,
        'assigned_by' => $assignedEditor->id,
        'assigned_at' => now(),
    ]);

    actingAs($otherEditor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('rejects pendiente to editada when production is not enabled', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    actingAs($editor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('rejects pendiente to editada attempted by a manager', function (UserRole $role) {
    actingAsRole($role);

    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->exists())->toBeFalse();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

// editada -> ok / a_corregir

it('lets managers move a detail from editada to ok', function (UserRole $role) {
    $actor = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Editada, $actor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Ok->value])
        ->assertSessionHasNoErrors();

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->latest('id')->first();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(2)
        ->and($latest->status)->toBe(EditingStatus::Ok)
        ->and($latest->changed_by)->toBe($actor->id);
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('lets managers move a detail from editada to a_corregir', function (UserRole $role) {
    $actor = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Editada, $actor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::ACorregir->value])
        ->assertSessionHasNoErrors();

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->latest('id')->first();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(2)
        ->and($latest->status)->toBe(EditingStatus::ACorregir)
        ->and($latest->changed_by)->toBe($actor->id);
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('rejects editada to ok attempted by the assigned editor', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Editada, $editor);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    actingAs($editor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Ok->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(1);
});

// a_corregir -> editada

it('lets the assigned editor move a detail from a_corregir to editada', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::ACorregir, $editor);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    actingAs($editor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasNoErrors();

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->latest('id')->first();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(2)
        ->and($latest->status)->toBe(EditingStatus::Editada)
        ->and($latest->changed_by)->toBe($editor->id);
});

it('rejects a_corregir to editada by an editor not assigned to the detail', function () {
    $assignedEditor = User::factory()->withRole(UserRole::Editor)->create();
    $otherEditor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::ACorregir, $assignedEditor);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $assignedEditor->id,
        'assigned_by' => $assignedEditor->id,
        'assigned_at' => now(),
    ]);

    actingAs($otherEditor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(1);
});

// ok -> a_corregir

it('lets managers move a detail from ok to a_corregir', function (UserRole $role) {
    $actor = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Ok, $actor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::ACorregir->value])
        ->assertSessionHasNoErrors();

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->latest('id')->first();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(2)
        ->and($latest->status)->toBe(EditingStatus::ACorregir)
        ->and($latest->changed_by)->toBe($actor->id);
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('rejects ok to editada, the only legal move from ok is to a_corregir', function () {
    $actor = actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Ok, $actor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(1);
});

// Illegal transitions, representative set

it('rejects illegal transitions', function (EditingStatus $from, EditingStatus $target) {
    $actor = actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    if ($from !== EditingStatus::Pendiente) {
        seedEditingStatus($detail, $from, $actor);
    }

    post(route('editing-status.store', $detail), ['status' => $target->value])
        ->assertSessionHasErrors();

    $expectedCount = $from === EditingStatus::Pendiente ? 0 : 1;
    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe($expectedCount);
})->with([
    'pendiente -> ok' => [EditingStatus::Pendiente, EditingStatus::Ok],
    'pendiente -> a_corregir' => [EditingStatus::Pendiente, EditingStatus::ACorregir],
    'editada -> editada' => [EditingStatus::Editada, EditingStatus::Editada],
    'a_corregir -> ok' => [EditingStatus::ACorregir, EditingStatus::Ok],
    'ok -> ok' => [EditingStatus::Ok, EditingStatus::Ok],
]);

// Product not editable by photo

it('rejects any transition on a product that does not admit photo editing', function () {
    $actor = actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => false]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);
    seedEditingStatus($detail, EditingStatus::Editada, $actor);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Ok->value])
        ->assertSessionHasErrors();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(1);
});

// Route-level role gate

it('forbids taller from changing editing status', function () {
    actingAsRole(UserRole::Worker);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertForbidden();
});

// Append-only history, full cycle

it('appends a full history through the editing status cycle', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $manager->id,
        'assigned_at' => now(),
    ]);

    actingAs($editor);
    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasNoErrors();

    actingAs($manager);
    post(route('editing-status.store', $detail), ['status' => EditingStatus::ACorregir->value])
        ->assertSessionHasNoErrors();

    actingAs($editor);
    post(route('editing-status.store', $detail), ['status' => EditingStatus::Editada->value])
        ->assertSessionHasNoErrors();

    actingAs($manager);
    post(route('editing-status.store', $detail), ['status' => EditingStatus::Ok->value])
        ->assertSessionHasNoErrors();

    $changes = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get();

    expect($changes)->toHaveCount(4)
        ->and($changes->pluck('status')->all())->toBe([
            EditingStatus::Editada,
            EditingStatus::ACorregir,
            EditingStatus::Editada,
            EditingStatus::Ok,
        ])
        ->and($detail->refresh()->currentEditingStatus())->toBe(EditingStatus::Ok);
});
