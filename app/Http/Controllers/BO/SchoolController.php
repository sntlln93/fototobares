<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Schools\CreateSchool;
use App\Actions\Schools\DeleteSchool;
use App\Actions\Schools\UpdateSchool;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\Order;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var string search */
        $search = $request->query('search');

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        $sort_order = $request->query('sort_order') === 'desc' ? 'desc' : 'asc';

        $schools = School::with(['principal', 'classrooms.teacher', 'address', 'user'])
            ->when($search, function ($q) use ($search) {
                return $q->where('name', 'like', "%$search%")
                    ->orWhere('id', 'like', "%$search%")
                    ->orWhereHas('principal', function ($q) use ($search) {
                        return $q->where('name', 'like', "%$search%");
                    });
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(20);

        return Inertia::render('schools/index', [
            'schools' => SchoolResource::collection($schools),
        ]);
    }

    public function create(): Response
    {
        $users = User::query()
            ->whereHas('roles', function ($q) {
                return $q->where('name', UserRole::Admin);
            })->get();

        return Inertia::render('schools/create', [
            'users' => $users,
        ]);
    }

    public function store(StoreSchoolRequest $request, CreateSchool $action): RedirectResponse
    {
        $action->handle($request->validated());

        return redirect(route('schools.index'));
    }

    public function edit(School $school): Response
    {
        $users = User::query()
            ->whereHas('roles', function ($q) {
                return $q->where('name', UserRole::Admin);
            })->get();

        return Inertia::render('schools/edit', [
            'school' => $school->load(['principal', 'address']),
            'users' => $users,
        ]);
    }

    public function update(School $school, StoreSchoolRequest $request, UpdateSchool $action): RedirectResponse
    {
        $action->handle(['school' => $school, 'data' => $request->validated()]);

        return redirect(route('schools.index'));
    }

    public function destroy(School $school, DeleteSchool $action): RedirectResponse
    {
        $classrooms = $school->classrooms->pluck('id');
        $hasOrders = Order::withTrashed()
            ->whereIn('classroom_id', $classrooms)
            ->exists();

        if ($hasOrders) {
            return back()->withErrors(['school' => 'No se pueden eliminar escuelas que tengan pedidos registrados']);
        }

        $action->handle(['school' => $school]);

        return redirect(route('schools.index'));
    }

    public function show(School $school): Response
    {
        return Inertia::render('schools/show')->with([
            'school' => new SchoolResource($school->load([
                'classrooms.teacher',
                'principal',
                'address',
                'user',
            ])),
        ]);
    }
}
