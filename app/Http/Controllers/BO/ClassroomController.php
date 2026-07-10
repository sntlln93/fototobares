<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\ContactRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Classroom;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function destroy(Classroom $classroom): RedirectResponse
    {
        $school_id = $classroom->school_id;

        $hasOrders = Order::withTrashed()
            ->where('classroom_id', $classroom->id)
            ->exists();

        if ($hasOrders) {
            return back()->withErrors(['classroom' => 'No se pueden eliminar cursos que tengan pedidos registrados']);
        }

        DB::transaction(function () use ($classroom) {
            $classroom->teacher()->delete();
            $classroom->delete();
        });

        return redirect()->route('schools.show', ['school' => $school_id]);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:10'],
            'teacher' => ['nullable', 'string', 'min:4', 'max:30'],
            'phone' => ['nullable', 'numeric'],
        ]);

        DB::transaction(function () use ($classroom, $validated) {
            $classroom->update([
                'name' => $validated['name'],
            ]);

            // Only update teacher if data is provided
            if ($validated['teacher'] !== null || $validated['phone'] !== null) {
                $classroom->teacher()->update([
                    'name' => $validated['teacher'],
                    'phone' => $validated['phone'],
                ]);
            }
        });

        return redirect(to: route('schools.show', [
            'school' => $classroom->school_id,
        ]));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:10'],
            'school_id' => ['required', 'exists:schools,id'],
            'teacher' => ['nullable', 'string', 'min:4', 'max:30'],
            'phone' => ['nullable', 'numeric'],
        ]);

        DB::transaction(function () use ($validated) {
            $classroom = Classroom::create([
                'name' => $validated['name'],
                'school_id' => $validated['school_id'],
            ]);

            // Only create teacher contact if data is provided
            if ($validated['teacher'] !== null || $validated['phone'] !== null) {
                $classroom->teacher()->create([
                    'name' => $validated['teacher'],
                    'phone' => $validated['phone'],
                    'role' => ContactRole::Teacher,
                ]);
            }
        });

        return redirect(to: route('schools.show', [
            'school' => $request->school_id,
        ]));
    }
}
