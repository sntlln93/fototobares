<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Classrooms\CreateClassroom;
use App\Actions\Classrooms\DeleteClassroom;
use App\Actions\Classrooms\UpdateClassroom;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreClassroomRequest;
use App\Http\Requests\BO\UpdateClassroomRequest;
use App\Http\Resources\OrderResource;
use App\Models\Classroom;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function show(Classroom $classroom): Response
    {
        $orders = Order::where('classroom_id', $classroom->id)
            ->with('client', 'products.type', 'classroom.school')
            ->paginate(20);

        return Inertia::render('classrooms/show', [
            'classroom' => $classroom->load('teacher', 'school'),
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function store(StoreClassroomRequest $request, CreateClassroom $action): RedirectResponse
    {
        $validated = $request->validated();

        $action->handle($validated);

        return redirect(route('schools.show', ['school' => $validated['school_id']]));
    }

    public function update(UpdateClassroomRequest $request, Classroom $classroom, UpdateClassroom $action): RedirectResponse
    {
        $action->handle(['classroom' => $classroom, 'data' => $request->validated()]);

        return redirect(route('schools.show', ['school' => $classroom->school_id]));
    }

    public function destroy(Classroom $classroom, DeleteClassroom $action): RedirectResponse
    {
        $hasOrders = Order::withTrashed()
            ->where('classroom_id', $classroom->id)
            ->exists();

        if ($hasOrders) {
            return back()->withErrors(['classroom' => 'No se pueden eliminar cursos que tengan pedidos registrados']);
        }

        $school_id = $classroom->school_id;

        $action->handle(['classroom' => $classroom]);

        return redirect()->route('schools.show', ['school' => $school_id]);
    }
}
