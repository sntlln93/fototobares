<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Schools\CreateSchoolAction;
use App\Actions\Schools\DeleteSchoolAction;
use App\Actions\Schools\UpdateSchoolAction;
use App\Data\Schools\SchoolDeletionData;
use App\Data\Schools\SchoolUpdateData;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\Order;
use App\Models\Product;
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

    public function store(StoreSchoolRequest $request, CreateSchoolAction $action): RedirectResponse
    {
        $action->handle($request->toData());

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

    public function update(School $school, StoreSchoolRequest $request, UpdateSchoolAction $action): RedirectResponse
    {
        $action->handle(new SchoolUpdateData($school, $request->toData()));

        return redirect(route('schools.index'));
    }

    public function destroy(School $school, DeleteSchoolAction $action): RedirectResponse
    {
        $classrooms = $school->classrooms->pluck('id');
        $hasOrders = Order::withTrashed()
            ->whereIn('classroom_id', $classrooms)
            ->exists();

        if ($hasOrders) {
            return back()->withErrors(['school' => 'No se pueden eliminar escuelas que tengan pedidos registrados']);
        }

        $action->handle(new SchoolDeletionData($school));

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
            'assignableEditors' => User::assignableEditors()->get(['id', 'name']),
            'photoProducts' => Product::where('has_photo', true)->get(['id', 'name']),
        ]);
    }
}
