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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

/**
 * Locates a mapped row by order_detail id inside the schools -> classrooms
 * -> photoProductGroups -> rows Inertia payload.
 *
 * @param  array<int, array<string, mixed>>  $schools
 * @return array<string, mixed>
 */
function findEditionRow(array $schools, int $detailId): ?array
{
    foreach ($schools as $school) {
        foreach ($school['classrooms'] as $classroom) {
            foreach ($classroom['photoProductGroups'] as $group) {
                foreach ($group['rows'] as $row) {
                    if ($row['id'] === $detailId) {
                        return $row;
                    }
                }
            }
        }
    }

    return null;
}

/**
 * Flattens every row across every photo-product group of every classroom of
 * every school in the Inertia payload.
 *
 * @param  array<int, array<string, mixed>>  $schools
 * @return Collection<int, array<string, mixed>>
 */
function flattenEditionRows(array $schools): Collection
{
    return collect($schools)
        ->pluck('classrooms')->flatten(1)
        ->pluck('photoProductGroups')->flatten(1)
        ->pluck('rows')->flatten(1);
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
        $rowIds = flattenEditionRows($schools)->pluck('id');

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
        $rowIds = flattenEditionRows($schools)->pluck('id');

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
        $rowIds = flattenEditionRows($schools)->pluck('id');

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

// Dynamic variant columns (#193): the "variants" map replaces the hardcoded
// diseño/tamaño columns, and the group's variant_columns is the sorted union
// of its rows' variant labels.

it('exposes a variants map keyed by variant label, and derives variant_columns as their sorted union', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create(['has_photo' => true]);
    $withVariantOrder = Order::factory()->create(['classroom_id' => $classroom->id]);
    $withoutVariantOrder = Order::factory()->create(['classroom_id' => $classroom->id]);
    $withVariant = OrderDetail::factory()->create([
        'order_id' => $withVariantOrder->id,
        'product_id' => $product->id,
        'variant' => [
            ['label' => 'Tipo de foto', 'value' => ['label' => 'Grupo']],
        ],
    ]);
    $withoutVariant = OrderDetail::factory()->create([
        'order_id' => $withoutVariantOrder->id,
        'product_id' => $product->id,
        'variant' => [],
    ]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($product, $withVariant, $withoutVariant) {
        $schools = $page->toArray()['props']['schools'];

        expect(findEditionRow($schools, $withVariant->id)['variants'])->toBe(['Tipo de foto' => ['label' => 'Grupo']])
            ->and(findEditionRow($schools, $withoutVariant->id)['variants'])->toBe([]);

        $group = collect($schools)->pluck('classrooms')->flatten(1)
            ->pluck('photoProductGroups')->flatten(1)
            ->firstWhere('product_id', $product->id);

        expect($group['product_name'])->toBe($product->name)
            ->and($group['variant_columns'])->toBe(['Tipo de foto']);
    });
});

// photo_number and variant_search columns (search filters, #194)

it('exposes photo_number and variant_search for client-side search filtering', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create(['photo_number' => 42]);
    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'variant' => [
            ['label' => 'Tipo de foto', 'value' => ['label' => 'Grupo']],
            ['label' => 'Color', 'value' => ['label' => 'Celeste']],
        ],
    ]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail) {
        $schools = $page->toArray()['props']['schools'];
        $row = findEditionRow($schools, $detail->id);

        expect($row['photo_number'])->toBe(42)
            ->and($row['variant_search'])->toContain('Grupo')
            ->and($row['variant_search'])->toContain('Celeste');
    });
});

// modelo cuadro / color / banda talle derived columns (criterion 3 backend
// note; #193 moved all three under canManage gating)

it('derives modelo cuadro, color and banda talle from the order mural/banda, manager-only', function () {
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

    // Editor view: modelo cuadro, color and banda talle are all manager-only
    test()->actingAs($editor);
    get(route('edition.index'))->assertInertia(function (Assert $page) use ($photoDetail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $photoDetail->id);

        expect($row)->not->toHaveKey('modelo_cuadro')
            ->and($row)->not->toHaveKey('color')
            ->and($row)->not->toHaveKey('banda_talle');
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

it('groups rows by school, classroom and photo product, with an order_count per classroom', function () {
    actingAsRole(UserRole::Office);

    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    $product = Product::factory()->create(['has_photo' => true]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($school, $classroom, $product, $detail) {
        $schools = $page->toArray()['props']['schools'];
        $schoolGroup = collect($schools)->firstWhere('id', $school->id);

        expect($schoolGroup)->not->toBeNull();

        $classroomGroup = collect($schoolGroup['classrooms'])->firstWhere('id', $classroom->id);

        expect($classroomGroup)->not->toBeNull()
            ->and($classroomGroup['order_count'])->toBe(1);

        $productGroup = collect($classroomGroup['photoProductGroups'])->firstWhere('product_id', $product->id);

        expect($productGroup)->not->toBeNull()
            ->and(collect($productGroup['rows'])->pluck('id')->all())->toBe([$detail->id]);
    });
});

// order_seq: stable per-order index within the classroom, shared across
// photo-product groups (#193 visual linking)

it('assigns the same order_seq to every row of the same order, across photo-product groups', function () {
    actingAsRole(UserRole::Office);

    $classroom = Classroom::factory()->create();
    $productA = Product::factory()->create(['has_photo' => true]);
    $productB = Product::factory()->create(['has_photo' => true]);

    $orderOne = Order::factory()->create(['classroom_id' => $classroom->id]);
    $orderTwo = Order::factory()->create(['classroom_id' => $classroom->id]);

    $oneA = OrderDetail::factory()->create(['order_id' => $orderOne->id, 'product_id' => $productA->id]);
    $oneB = OrderDetail::factory()->create(['order_id' => $orderOne->id, 'product_id' => $productB->id]);
    $twoA = OrderDetail::factory()->create(['order_id' => $orderTwo->id, 'product_id' => $productA->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($oneA, $oneB, $twoA) {
        $schools = $page->toArray()['props']['schools'];

        $rowOneA = findEditionRow($schools, $oneA->id);
        $rowOneB = findEditionRow($schools, $oneB->id);
        $rowTwoA = findEditionRow($schools, $twoA->id);

        expect($rowOneA['order_seq'])->toBe($rowOneB['order_seq'])
            ->and($rowOneA['order_seq'])->not->toBe($rowTwoA['order_seq']);
    });
});

// allowed_targets per row wiring (code-review F1, REQUIRED 2)

it('reports no allowed targets for a manager viewing a pendiente row', function () {
    actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $detail = OrderDetail::factory()->enabled()->create(['product_id' => $product->id]);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $detail->id);

        expect($row['allowed_targets'])->toBe([]);
    });
});

it('allows the assigned editor to move a pendiente row to editada once production is enabled', function () {
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

    test()->actingAs($editor);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $detail->id);

        expect($row['allowed_targets'])->toBe(['editada']);
    });
});

it('reports no allowed targets for the assigned editor on a pendiente row without production enabled', function () {
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
        $row = findEditionRow($page->toArray()['props']['schools'], $detail->id);

        expect($row['allowed_targets'])->toBe([]);
    });
});

it('allows the assigned editor to move an a_corregir row back to editada', function () {
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
    OrderEditingStatusChange::create([
        'order_detail_id' => $detail->id,
        'status' => EditingStatus::ACorregir,
        'changed_by' => $manager->id,
        'changed_at' => now(),
    ]);

    test()->actingAs($editor);

    get(route('edition.index'))->assertInertia(function (Assert $page) use ($detail) {
        $row = findEditionRow($page->toArray()['props']['schools'], $detail->id);

        expect($row['editing_status'])->toBe('a_corregir')
            ->and($row['allowed_targets'])->toBe(['editada']);
    });
});

// N+1 guard (code-review F1, REQUIRED 1): eager-loading `editingStatusChanges`
// must yield a single query for the whole board, not one per row.

it('does not issue a per-row editing status query when building the board', function () {
    $manager = actingAsRole(UserRole::Office);

    $product = Product::factory()->create(['has_photo' => true]);
    $details = OrderDetail::factory()->count(3)->create(['product_id' => $product->id]);

    foreach ($details as $detail) {
        OrderEditingStatusChange::create([
            'order_detail_id' => $detail->id,
            'status' => EditingStatus::Editada,
            'changed_by' => $manager->id,
            'changed_at' => now(),
        ]);
    }

    $statusQueries = 0;
    DB::listen(function ($query) use (&$statusQueries) {
        if (str_contains($query->sql, 'order_editing_status_changes')) {
            $statusQueries++;
        }
    });

    get(route('edition.index'))->assertOk();

    expect($statusQueries)->toBe(1);
});
