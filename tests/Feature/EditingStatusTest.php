<?php

declare(strict_types=1);

use App\Actions\EditingStatus\RevertEditingStatusAction;
use App\Data\EditingStatus\RevertEditingStatusData;
use App\Enums\EditingStatus;
use App\Enums\UserRole;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;
use App\Models\OrderEditingStatusChange;
use App\Models\Product;
use App\Models\User;
use Illuminate\Validation\ValidationException;

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

// EditingStatus::allowedTargets() — single source of truth for the
// transition matrix (refactored for #177's board), unit-tested directly
// against every branch, not just through the HTTP endpoint above.

it('computes the allowed targets for every branch of the transition matrix', function (
    EditingStatus $current,
    bool $isManager,
    bool $isAssignedEditor,
    bool $productionEnabled,
    array $expected,
) {
    expect(EditingStatus::allowedTargets($current, $isManager, $isAssignedEditor, $productionEnabled))
        ->toBe($expected);
})->with([
    // Pendiente -> Editada only for the assigned editor once production is enabled
    'pendiente, assigned editor, production enabled' => [
        EditingStatus::Pendiente, false, true, true, [EditingStatus::Editada],
    ],
    'pendiente, assigned editor, production not enabled' => [
        EditingStatus::Pendiente, false, true, false, [],
    ],
    'pendiente, not the assigned editor, production enabled' => [
        EditingStatus::Pendiente, false, false, true, [],
    ],
    'pendiente, manager (never assigned)' => [
        EditingStatus::Pendiente, true, false, true, [],
    ],

    // Editada -> {Ok, ACorregir} only for a manager
    'editada, manager' => [
        EditingStatus::Editada, true, false, true, [EditingStatus::Ok, EditingStatus::ACorregir],
    ],
    'editada, assigned editor (not a manager)' => [
        EditingStatus::Editada, false, true, true, [],
    ],
    'editada, neither manager nor assigned editor' => [
        EditingStatus::Editada, false, false, true, [],
    ],

    // Ok -> ACorregir only for a manager
    'ok, manager' => [
        EditingStatus::Ok, true, false, true, [EditingStatus::ACorregir],
    ],
    'ok, assigned editor (not a manager)' => [
        EditingStatus::Ok, false, true, true, [],
    ],
    'ok, neither manager nor assigned editor' => [
        EditingStatus::Ok, false, false, true, [],
    ],

    // ACorregir -> Editada only for the assigned editor
    'a_corregir, assigned editor' => [
        EditingStatus::ACorregir, false, true, true, [EditingStatus::Editada],
    ],
    'a_corregir, manager (not the assigned editor)' => [
        EditingStatus::ACorregir, true, false, true, [],
    ],
    'a_corregir, neither manager nor assigned editor' => [
        EditingStatus::ACorregir, false, false, true, [],
    ],
]);

// RevertEditingStatusAction (#191)

it('lets the assigned editor revert a pendiente to editada transition', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    $editada = seedEditingStatus($detail, EditingStatus::Editada, $editor);

    app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $editor->id,
    ));

    $changes = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get();
    $latest = $changes->last();

    expect($changes)->toHaveCount(2)
        ->and($changes->first()->id)->toBe($editada->id)
        ->and($latest->status)->toBe(EditingStatus::Pendiente)
        ->and($latest->is_revert)->toBeTrue()
        ->and($detail->refresh()->currentEditingStatus())->toBe(EditingStatus::Pendiente);
});

it('lets a manager revert an editada to ok transition back to editada', function (UserRole $role) {
    $manager = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    seedEditingStatus($detail, EditingStatus::Editada, $manager);
    seedEditingStatus($detail, EditingStatus::Ok, $manager);

    app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $manager->id,
    ));

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get()->last();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(3)
        ->and($latest->status)->toBe(EditingStatus::Editada)
        ->and($latest->is_revert)->toBeTrue();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('lets a manager revert an ok to a_corregir transition back to ok', function (UserRole $role) {
    $manager = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    seedEditingStatus($detail, EditingStatus::Ok, $manager);
    seedEditingStatus($detail, EditingStatus::ACorregir, $manager);

    app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $manager->id,
    ));

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get()->last();

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(3)
        ->and($latest->status)->toBe(EditingStatus::Ok)
        ->and($latest->is_revert)->toBeTrue();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('reverting the latest entry of a multi-step history lands on the second-to-latest status', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    seedEditingStatus($detail, EditingStatus::Editada, $editor);
    seedEditingStatus($detail, EditingStatus::Ok, $manager);
    seedEditingStatus($detail, EditingStatus::ACorregir, $manager);

    app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $manager->id,
    ));

    $latest = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get()->last();

    expect($latest->status)->toBe(EditingStatus::Ok)
        ->and($latest->is_revert)->toBeTrue();
});

it('rejects a revert attempted by an editor who is not the author of the latest entry, appending no row', function () {
    $author = User::factory()->withRole(UserRole::Editor)->create();
    $otherEditor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    seedEditingStatus($detail, EditingStatus::Editada, $author);

    expect(fn () => app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $otherEditor->id,
    )))->toThrow(ValidationException::class);

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(1);
});

it('rejects a revert attempted by a manager who is not the author of the latest entry, appending no row', function () {
    $author = actingAsRole(UserRole::Office);
    $otherManager = User::factory()->withRole(UserRole::Admin)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    seedEditingStatus($detail, EditingStatus::Editada, $author);
    seedEditingStatus($detail, EditingStatus::Ok, $author);

    expect(fn () => app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $otherManager->id,
    )))->toThrow(ValidationException::class);

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->count())->toBe(2);
});

it('rejects reverting a detail with no history, appending no row', function () {
    $actor = actingAsRole(UserRole::Office);
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    expect(fn () => app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $actor->id,
    )))->toThrow(ValidationException::class);

    expect(OrderEditingStatusChange::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('never mutates pre-existing history rows on revert', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    $editada = seedEditingStatus($detail, EditingStatus::Editada, $editor);
    $ok = seedEditingStatus($detail, EditingStatus::Ok, $manager);

    $editadaBefore = $editada->refresh()->only(['id', 'status', 'changed_by', 'is_revert']);
    $okBefore = $ok->refresh()->only(['id', 'status', 'changed_by', 'is_revert']);

    app(RevertEditingStatusAction::class)->handle(new RevertEditingStatusData(
        orderDetailId: $detail->id,
        revertedById: $manager->id,
    ));

    $after = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get();

    expect($after)->toHaveCount(3)
        ->and($after->get(0)->only(['id', 'status', 'changed_by', 'is_revert']))->toBe($editadaBefore)
        ->and($after->get(1)->only(['id', 'status', 'changed_by', 'is_revert']))->toBe($okBefore)
        ->and($after->get(2)->is_revert)->toBeTrue()
        ->and($after->get(2)->status)->toBe(EditingStatus::Editada);
});

it('reverts the latest transition through the HTTP endpoint as the authoring user', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    seedEditingStatus($detail, EditingStatus::Editada, $editor);

    actingAs($editor);

    post(route('editing-status.revert', $detail))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $changes = OrderEditingStatusChange::where('order_detail_id', $detail->id)->orderBy('id')->get();

    expect($changes)->toHaveCount(2)
        ->and($changes->last()->status)->toBe(EditingStatus::Pendiente)
        ->and($changes->last()->is_revert)->toBeTrue();
});
