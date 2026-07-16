<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\EditorOrderDetailAssignment;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\School;
use App\Models\User;

use function Pest\Laravel\delete;
use function Pest\Laravel\post;

// Individual assign (editor-assignments.store)

it('assigns an editor to a photo detail', function (UserRole $role) {
    $actor = actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
    ])->assertSessionHasNoErrors();

    $assignment = EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->firstOrFail();

    expect($assignment->editor_id)->toBe($editor->id)
        ->and($assignment->assigned_by)->toBe($actor->id)
        ->and($assignment->assigned_at)->not->toBeNull();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('accepts an editor_id belonging to a user with the administración role', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $admin = User::factory()->withRole(UserRole::Admin)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $admin->id,
    ])->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->first()?->editor_id)
        ->toBe($admin->id);
});

it('overwrites the previous assignment on reassignment', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $firstEditor = User::factory()->withRole(UserRole::Editor)->create();
    $secondEditor = User::factory()->withRole(UserRole::Editor)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $firstEditor->id,
    ])->assertSessionHasNoErrors();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $secondEditor->id,
    ])->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->count())->toBe(1);

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->first()?->editor_id)
        ->toBe($secondEditor->id);
});

it('rejects an editor_id whose role is not assignable', function (UserRole $role) {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $notAssignable = User::factory()->withRole($role)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $notAssignable->id,
    ])->assertSessionHasErrors('editor_id');

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
})->with([
    'oficina' => [UserRole::Office],
    'taller' => [UserRole::Worker],
    'master' => [UserRole::Master],
]);

it('rejects self-assignment even for administración', function () {
    $actor = actingAsRole(UserRole::Admin);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $actor->id,
    ])->assertSessionHasErrors('editor_id');

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('rejects assigning a detail whose product does not admit photo editing', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => false]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
    ])->assertSessionHasErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('denies editor and taller from assigning individually', function (UserRole $role) {
    actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    post(route('editor-assignments.store'), [
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
    ])->assertForbidden();
})->with([
    'editor' => [UserRole::Editor],
    'taller' => [UserRole::Worker],
]);

// Unassign (editor-assignments.destroy)

it('unassigns an existing editor assignment', function (UserRole $role) {
    actingAsRole($role);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    delete(route('editor-assignments.destroy', $detail))->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
]);

it('is a no-op unassigning a detail with no assignment', function () {
    actingAsRole(UserRole::Office);

    $detail = OrderDetail::factory()->create();

    delete(route('editor-assignments.destroy', $detail))->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('denies editor and taller from unassigning', function (UserRole $role) {
    actingAsRole($role);

    $detail = OrderDetail::factory()->create();

    delete(route('editor-assignments.destroy', $detail))->assertForbidden();
})->with([
    'editor' => [UserRole::Editor],
    'taller' => [UserRole::Worker],
]);

// Bulk assign (editor-assignments.bulk)

it('bulk assigns every in-scope detail across a school for the selected products', function () {
    $actor = actingAsRole(UserRole::Office);

    $school = School::factory()->create();
    $classroomA = Classroom::factory()->create(['school_id' => $school->id]);
    $classroomB = Classroom::factory()->create(['school_id' => $school->id]);
    $product = Product::factory()->create(['has_photo' => true]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    $orderA = Order::factory()->create(['classroom_id' => $classroomA->id]);
    $orderB = Order::factory()->create(['classroom_id' => $classroomB->id]);

    $detailA = OrderDetail::factory()->enabled()->create([
        'order_id' => $orderA->id,
        'product_id' => $product->id,
    ]);
    $detailB = OrderDetail::factory()->enabled()->create([
        'order_id' => $orderB->id,
        'product_id' => $product->id,
    ]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id],
        'school_id' => $school->id,
    ])->assertSessionHasNoErrors();

    foreach ([$detailA, $detailB] as $detail) {
        $assignment = EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->first();
        expect($assignment)->not->toBeNull()
            ->and($assignment->editor_id)->toBe($editor->id)
            ->and($assignment->assigned_by)->toBe($actor->id);
    }
});

it('bulk assigns only the in-scope details of the selected classroom', function () {
    actingAsRole(UserRole::Office);

    $school = School::factory()->create();
    $targetClassroom = Classroom::factory()->create(['school_id' => $school->id]);
    $otherClassroom = Classroom::factory()->create(['school_id' => $school->id]);
    $product = Product::factory()->create(['has_photo' => true]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    $targetOrder = Order::factory()->create(['classroom_id' => $targetClassroom->id]);
    $otherOrder = Order::factory()->create(['classroom_id' => $otherClassroom->id]);

    $targetDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $targetOrder->id,
        'product_id' => $product->id,
    ]);
    $otherDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $otherOrder->id,
        'product_id' => $product->id,
    ]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id],
        'classroom_id' => $targetClassroom->id,
    ])->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $targetDetail->id)->exists())->toBeTrue()
        ->and(EditorOrderDetailAssignment::where('order_detail_id', $otherDetail->id)->exists())->toBeFalse();
});

it('bulk respects the selected product_ids', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    $selectedProduct = Product::factory()->create(['has_photo' => true]);
    $unselectedProduct = Product::factory()->create(['has_photo' => true]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    $selectedDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $selectedProduct->id,
    ]);
    $unselectedDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $unselectedProduct->id,
    ]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$selectedProduct->id],
        'classroom_id' => $classroom->id,
    ])->assertSessionHasNoErrors();

    expect(EditorOrderDetailAssignment::where('order_detail_id', $selectedDetail->id)->exists())->toBeTrue()
        ->and(EditorOrderDetailAssignment::where('order_detail_id', $unselectedDetail->id)->exists())->toBeFalse();
});

it('bulk excludes out-of-scope details', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $nonPhotoProduct = Product::factory()->create(['has_photo' => false]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    $normalOrder = Order::factory()->create(['classroom_id' => $classroom->id]);
    $cancelledOrder = Order::factory()->cancelled()->create(['classroom_id' => $classroom->id]);

    $nonPhotoDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $normalOrder->id,
        'product_id' => $nonPhotoProduct->id,
    ]);
    $deliveredDetail = OrderDetail::factory()->enabled()->delivered()->create([
        'order_id' => $normalOrder->id,
        'product_id' => $product->id,
    ]);
    $recycledDetail = OrderDetail::factory()->enabled()->recycled()->create([
        'order_id' => $normalOrder->id,
        'product_id' => $product->id,
    ]);
    $notEnabledDetail = OrderDetail::factory()->create([
        'order_id' => $normalOrder->id,
        'product_id' => $product->id,
    ]);
    $cancelledOrderDetail = OrderDetail::factory()->enabled()->create([
        'order_id' => $cancelledOrder->id,
        'product_id' => $product->id,
    ]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id, $nonPhotoProduct->id],
        'classroom_id' => $classroom->id,
    ])->assertSessionHasNoErrors();

    foreach ([$nonPhotoDetail, $deliveredDetail, $recycledDetail, $notEnabledDetail, $cancelledOrderDetail] as $detail) {
        expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
    }
});

it('bulk rejects a non-assignable editor_id', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $notAssignable = User::factory()->withRole(UserRole::Worker)->create();

    post(route('editor-assignments.bulk'), [
        'editor_id' => $notAssignable->id,
        'product_ids' => [$product->id],
        'classroom_id' => $classroom->id,
    ])->assertSessionHasErrors('editor_id');

    expect(EditorOrderDetailAssignment::query()->exists())->toBeFalse();
});

it('bulk rejects self-assignment', function () {
    $actor = actingAsRole(UserRole::Admin);

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create(['has_photo' => true]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $actor->id,
        'product_ids' => [$product->id],
        'classroom_id' => $classroom->id,
    ])->assertSessionHasErrors('editor_id');

    expect(EditorOrderDetailAssignment::query()->exists())->toBeFalse();
});

it('bulk requires exactly one of school_id or classroom_id', function () {
    actingAsRole(UserRole::Office);

    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    $product = Product::factory()->create(['has_photo' => true]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    $detail = OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id],
    ])->assertSessionHasErrors(['school_id', 'classroom_id']);

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id],
        'school_id' => $school->id,
        'classroom_id' => $classroom->id,
    ])->assertSessionHasErrors(['school_id', 'classroom_id']);

    expect(EditorOrderDetailAssignment::where('order_detail_id', $detail->id)->exists())->toBeFalse();
});

it('denies editor and taller from bulk assigning', function (UserRole $role) {
    actingAsRole($role);

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $editor = User::factory()->withRole(UserRole::Editor)->create();

    post(route('editor-assignments.bulk'), [
        'editor_id' => $editor->id,
        'product_ids' => [$product->id],
        'classroom_id' => $classroom->id,
    ])->assertForbidden();
})->with([
    'editor' => [UserRole::Editor],
    'taller' => [UserRole::Worker],
]);
