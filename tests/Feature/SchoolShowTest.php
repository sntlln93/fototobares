<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\School;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

beforeEach(function () {
    actingAsRole();
});

it('reports no assignable details when none of the school classrooms have one in scope', function () {
    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);

    $product = Product::factory()->create(['has_photo' => false]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    get(route('schools.show', ['school' => $school->id]))->assertInertia(
        fn (Assert $page) => $page
            ->component('schools/show')
            ->where('hasAssignableDetails', false),
    );
});

it('reports assignable details when at least one classroom has one in scope', function () {
    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);

    $product = Product::factory()->create(['has_photo' => true]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    get(route('schools.show', ['school' => $school->id]))->assertInertia(
        fn (Assert $page) => $page
            ->component('schools/show')
            ->where('hasAssignableDetails', true),
    );
});
