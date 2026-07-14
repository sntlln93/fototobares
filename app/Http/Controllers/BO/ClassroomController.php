<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Classrooms\CreateClassroom;
use App\Actions\Classrooms\DeleteClassroom;
use App\Actions\Classrooms\UpdateClassroom;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreClassroomRequest;
use App\Http\Requests\BO\UpdateClassroomRequest;
use App\Http\Resources\ClassroomStudentResource;
use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDraft;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function show(Request $request, Classroom $classroom): Response
    {
        /** @var string|null $search */
        $search = $request->query('search');

        $orders = Order::where('classroom_id', $classroom->id)
            ->with('client')
            ->withCount('products')
            ->search($search)
            ->get();

        $drafts = OrderDraft::where('classroom_id', $classroom->id)
            ->search($search)
            ->get();

        // Merged, interleaved by photo number: the listing follows the paper
        // sheet, where drafts and orders share the same sequence.
        $students = $orders->toBase()->concat($drafts->toBase())
            ->sortBy(fn (Order|OrderDraft $row): array => [
                $row->photo_number === null ? 1 : 0,
                (int) $row->photo_number,
                $row->created_at?->getTimestamp() ?? 0,
                $row->id,
            ])->values();

        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 20;

        $paginator = new LengthAwarePaginator(
            $students->forPage($page, $perPage),
            $students->count(),
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'pageName' => 'page',
            ],
        );

        $paginator->appends($request->query());

        return Inertia::render('classrooms/show', [
            'classroom' => $classroom->load('teacher', 'school'),
            'students' => ClassroomStudentResource::collection($paginator),
            'filters' => ['search' => $search],
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
