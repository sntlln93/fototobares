<?php

declare(strict_types=1);

use App\Enums\EditingStatus;
use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\EditorOrderDetailAssignment;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderEditingStatusChange;
use App\Models\Product;
use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

/**
 * Locates a mapped row by order_detail id inside the schools -> classrooms
 * -> rows Inertia payload.
 *
 * @param  array<int, array<string, mixed>>  $schools
 * @return array<string, mixed>
 */
function findEditionRow(array $schools, int $detailId): ?array
{
    foreach ($schools as $school) {
        foreach ($school['classrooms'] as $classroom) {
            foreach ($classroom['rows'] as $row) {
                if ($row['id'] === $detailId) {
                    return $row;
                }
            }
        }
    }

    return null;
}

// Route access (criterion 4 of #177, behavior beyond RoleAccessTest's matrix)

it('allows master, administración, oficina and editor into the edition board', function (UserRole $role) {
    actingAsRole($role);

    get(route('edition.index'))->assertOk();
})->with([
    'master' => [UserRole::Master],
    'administración' => [UserRole::Admin],
    'oficina' => [UserRole::Office],
    'editor' => [UserRole::Editor],
]);

it('forbids taller from the edition board', function () {
    actingAsRole(UserRole::Worker);

    get(route('edition.index'))->assertForbidden();
});

// Row scope: one per photo-editable order detail (criterion 1)

it('lists one row per photo-editable order detail and excludes non-photo products', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create();
    $photoProduct1 = Product::factory()->create(['has_photo' => true]);
    $photoProduct2 = Product::factory()->create(['has_photo' => true]);
    $nonPhotoProduct = Product::factory()->create(['has_photo' => false]);

    $detail1 = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $photoProduct1->id]);
    $detail2 = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $photoProduct2->id]);
    OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $nonPhotoProduct->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail1, $detail2) {
        $schools = $page->toArray()['props']['schools'];
        $rowIds = collect($schools)
            ->pluck('classrooms')->flatten(1)
            ->pluck('rows')->flatten(1)
            ->pluck('id');

        expect($rowIds->all())->toEqualCanonicalizing([$detail1->id, $detail2->id]);
    });
});

// Visibility: only non-delivered, non-cancelled orders (criterion 2)

it('excludes delivered details, recycled details and details of cancelled orders', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);

    $visible = OrderDetail::factory()->create(['product_id' => $product->id]);
    $delivered = OrderDetail::factory()->delivered()->create(['product_id' => $product->id]);
    $recycled = OrderDetail::factory()->recycled()->create(['product_id' => $product->id]);
    $cancelledOrder = Order::factory()->cancelled()->create();
    $cancelled = OrderDetail::factory()->create(['order_id' => $cancelledOrder->id, 'product_id' => $product->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($visible, $delivered, $recycled, $cancelled) {
        $schools = $page->toArray()['props']['schools'];
        $rowIds = collect($schools)
            ->pluck('classrooms')->flatten(1)
            ->pluck('rows')->flatten(1)
            ->pluck('id');

        expect($rowIds->all())->toBe([$visible->id])
            ->and($rowIds->all())->not->toContain($delivered->id, $recycled->id, $cancelled->id);
    });
});

// Editor scope (criterion 4)

it('scopes the editor role to only their own assigned rows', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $otherEditor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();
    $product = Product::factory()->create(['has_photo' => true]);

    $ownDetail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $otherEditorDetail = OrderDetail::factory()->create(['product_id' => $product->id]);
    $unassignedDetail = OrderDetail::factory()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $ownDetail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $manager->id,
        'assigned_at' => now(),
    ]);
    EditorOrderDetailAssignment::create([
        'order_detail_id' => $otherEditorDetail->id,
        'editor_id' => $otherEditor->id,
        'assigned_by' => $manager->id,
        'assigned_at' => now(),
    ]);

    test()->actingAs($editor);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($ownDetail, $otherEditorDetail, $unassignedDetail) {
        $schools = $page->toArray()['props']['schools'];
        $rowIds = collect($schools)
            ->pluck('classrooms')->flatten(1)
            ->pluck('rows')->flatten(1)
            ->pluck('id');

        expect($rowIds->all())->toBe([$ownDetail->id])
            ->and($rowIds->all())->not->toContain($otherEditorDetail->id, $unassignedDetail->id);
    });
});

// Role-conditional payload (criterion 5)

it('omits the assigned-editor field, accessory flags and classroom totals from the editor payload', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $manager->id,
        'assigned_at' => now(),
    ]);

    test()->actingAs($editor);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail) {
        $props = $page->toArray()['props'];
        $row = findEditionRow($props['schools'], $detail->id);

        expect($props['canManage'])->toBeFalse()
            ->and($row)->not->toBeNull()
            ->and($row)->not->toHaveKey('editor')
            ->and($row)->not->toHaveKey('accessories');

        foreach ($props['schools'] as $school) {
            foreach ($school['classrooms'] as $classroom) {
                expect($classroom)->not->toHaveKey('totals');
            }
        }
    });
});

it('includes the assigned-editor field, accessory flags and classroom totals for a manager view', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $detail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $editor->id,
        'assigned_at' => now(),
    ]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail, $editor) {
        $props = $page->toArray()['props'];
        $row = findEditionRow($props['schools'], $detail->id);

        expect($props['canManage'])->toBeTrue()
            ->and($row)->toHaveKey('editor')
            ->and($row['editor']['id'])->toBe($editor->id)
            ->and($row)->toHaveKey('accessories');

        foreach ($props['schools'] as $school) {
            foreach ($school['classrooms'] as $classroom) {
                expect($classroom)->toHaveKey('totals');
            }
        }
    });
});

// Accessory totals counted per order, not per row (criterion 6)

it('counts accessory totals once per order, not once per photo row', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);

    $photoProduct = Product::factory()->create(['has_photo' => true]);
    $carpeta = Product::factory()->ofType('carpeta')->create();

    // Two photo rows on the same order...
    OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $photoProduct->id]);
    OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $photoProduct->id]);
    // ...plus one carpeta on that same order
    OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $carpeta->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($classroom) {
        $props = $page->toArray()['props'];
        $classroomGroup = collect($props['schools'])->pluck('classrooms')->flatten(1)
            ->firstWhere('id', $classroom->id);

        expect($classroomGroup['totals']['carpeta'])->toBe(1);
    });
});

// diseño derived column (criterion 3 backend note)

it('derives diseño from the "Tipo de foto" variant entry, null when absent', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $withDiseno = OrderDetail::factory()->create([
        'product_id' => $product->id,
        'variant' => [
            ['label' => 'Tipo de foto', 'value' => ['label' => 'Grupo']],
        ],
    ]);
    $withoutDiseno = OrderDetail::factory()->create([
        'product_id' => $product->id,
        'variant' => [],
    ]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($withDiseno, $withoutDiseno) {
        $schools = $page->toArray()['props']['schools'];

        expect(findEditionRow($schools, $withDiseno->id)['diseno'])->toBe('Grupo')
            ->and(findEditionRow($schools, $withoutDiseno->id)['diseno'])->toBeNull();
    });
});

// modelo cuadro / color / banda talle derived columns (criterion 3 backend note)

it('derives modelo cuadro and color from the order mural, and banda talle for every role', function () {
    $editor = User::factory()->withRole(UserRole::Editor)->create();
    $manager = User::factory()->withRole(UserRole::Office)->create();

    $order = Order::factory()->create();
    $photoProduct = Product::factory()->create(['has_photo' => true]);
    $photoDetail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $photoProduct->id]);

    EditorOrderDetailAssignment::create([
        'order_detail_id' => $photoDetail->id,
        'editor_id' => $editor->id,
        'assigned_by' => $manager->id,
        'assigned_at' => now(),
    ]);

    $mural = Product::factory()->mural()->create(['name' => 'Moldura fina']);
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $mural->id,
        'variant' => [['label' => 'Color', 'value' => ['label' => 'Negro']]],
    ]);

    $banda = Product::factory()->banda()->create();
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $banda->id,
        'variant' => [['label' => 'Talle', 'value' => ['label' => 'M']]],
    ]);

    // Manager view
    test()->actingAs($manager);
    get(route('edition.index'))->assertInertia(function (Assert $page) use ($photoDetail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $photoDetail->id);

        expect($row['modelo_cuadro'])->toBe('Moldura fina')
            ->and($row['color'])->toBe('Negro')
            ->and($row['banda_talle'])->toBe('M');
    });

    // Editor view: banda talle still present, unlike accessories/editor
    test()->actingAs($editor);
    get(route('edition.index'))->assertInertia(function (Assert $page) use ($photoDetail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $photoDetail->id);

        expect($row['banda_talle'])->toBe('M');
    });
});

// Current editing status per row (criterion 6 of #176, exposed on #177's board)

it('reflects the current editing status per row, defaulting to pendiente', function () {
    $actor = actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $pending = OrderDetail::factory()->create(['product_id' => $product->id]);
    $edited = OrderDetail::factory()->create(['product_id' => $product->id]);

    OrderEditingStatusChange::create([
        'order_detail_id' => $edited->id,
        'status' => EditingStatus::Editada,
        'changed_by' => $actor->id,
        'changed_at' => now(),
    ]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($pending, $edited) {
        $schools = $page->toArray()['props']['schools'];

        expect(findEditionRow($schools, $pending->id)['editing_status'])->toBe('pendiente')
            ->and(findEditionRow($schools, $edited->id)['editing_status'])->toBe('editada');
    });
});

// Grouping by school -> classroom (structural sanity, ties #177's core shape)

it('groups rows by school and then by classroom', function () {
    actingAsRole(UserRole::Office);

    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    $product = Product::factory()->create(['has_photo' => true]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($school, $classroom, $detail) {
        $schools = $page->toArray()['props']['schools'];
        $schoolGroup = collect($schools)->firstWhere('id', $school->id);

        expect($schoolGroup)->not->toBeNull();

        $classroomGroup = collect($schoolGroup['classrooms'])->firstWhere('id', $classroom->id);

        expect($classroomGroup)->not->toBeNull()
            ->and(collect($classroomGroup['rows'])->pluck('id')->all())->toBe([$detail->id]);
    });
});
