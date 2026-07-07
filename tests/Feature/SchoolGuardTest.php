<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Order;
use App\Models\School;

use function Pest\Laravel\delete;

it('cannot delete a school with orders in its classrooms', function () {
    actingAsRole();

    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    Order::factory()->create(['classroom_id' => $classroom->id]);

    delete(route('schools.destroy', $school))->assertSessionHasErrors('school');

    expect(School::find($school->id))->not->toBeNull();
});

it('can delete a school without orders even when an order id matches its classroom id', function () {
    actingAsRole();

    // Regresión: el guard viejo comparaba ids de pedidos contra ids de cursos
    $schoolWithOrders = School::factory()->create();
    $busyClassroom = Classroom::factory()->create(['school_id' => $schoolWithOrders->id]);

    $school = School::factory()->create();
    $emptyClassroom = Classroom::factory()->create(['school_id' => $school->id]);

    // Genera pedidos hasta que exista uno cuyo id coincida con el id del curso vacío
    while (Order::withTrashed()->max('id') < $emptyClassroom->id) {
        Order::factory()->create(['classroom_id' => $busyClassroom->id]);
    }

    delete(route('schools.destroy', $school))->assertSessionHasNoErrors();

    expect(School::find($school->id))->toBeNull();
});

it('cannot delete a classroom with orders', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    Order::factory()->create(['classroom_id' => $classroom->id]);

    delete(route('classrooms.destroy', $classroom))->assertSessionHasErrors('classroom');

    expect(Classroom::find($classroom->id))->not->toBeNull();
});

it('can delete a classroom without orders even when an order id matches its id', function () {
    actingAsRole();

    // Regresión: el guard viejo hacía Order::where('id', $classroom->id)
    $busyClassroom = Classroom::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $busyClassroom->school_id]);

    while (Order::withTrashed()->max('id') < $classroom->id) {
        Order::factory()->create(['classroom_id' => $busyClassroom->id]);
    }

    delete(route('classrooms.destroy', $classroom))->assertSessionHasNoErrors();

    expect(Classroom::find($classroom->id))->toBeNull();
});
