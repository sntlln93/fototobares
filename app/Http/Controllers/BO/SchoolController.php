<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\ContactRole;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\Order;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        /** @var string search */
        $search = $request->query('search');

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        /** @var string sort_order */
        $sort_order = $request->query('sort_order') ?? 'asc';

        $schools = School::with(['principal', 'classrooms.teacher', 'address', 'user'])
            ->when($search, function ($q) use ($search) {
                return $q->where('name', 'like', "%$search%")
                    ->orWhere('id', 'like', "%$search%")
                    ->orWhereHas('principal', function ($q) use ($search) {
                        return $q->where('name', 'like', "%$search%");
                    });
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(10);

        return Inertia::render('schools/index', [
            'schools' => SchoolResource::collection($schools),
        ]);
    }

    public function create(): \Inertia\Response
    {
        $users = User::query()
            ->whereHas('roles', function ($q) {
                return $q->where('name', UserRole::Admin);
            })->get();

        return Inertia::render('schools/create', [
            'users' => $users,
        ]);
    }

    public function store(StoreSchoolRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $school = School::create($validated['school']);

            if (isset($validated['principal'])) {
                $school->principal()->create([
                    ...$validated['principal'],
                    'role' => ContactRole::Principal,
                ]);
            }

            $school->address()->create($validated['address']);
        });

        return redirect(route('schools.index'));
    }

    public function edit(School $school): \Inertia\Response
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

    public function update(School $school, StoreSchoolRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $school) {
            $school->update($validated['school']);

            if (isset($validated['principal']) && ! $school->principal) {
                $school->principal()->create([
                    ...$validated['principal'],
                    'role' => ContactRole::Principal,
                ]);
            } elseif (isset($validated['principal']) && $school->principal) {
                $school->principal()->update($validated['principal']);
            }

            $school->address()->update($validated['address']);
        });

        return redirect(route('schools.index'));

    }

    public function destroy(School $school): \Illuminate\Http\RedirectResponse
    {
        $classrooms = $school->classrooms->pluck('id');
        $orders = Order::query()
            ->whereIn('id', $classrooms)
            ->get();

        if (count($orders) > 0) {
            return back()->withErrors('No se pueden eliminar escuelas que tengan pedidos registrados');
        }

        DB::transaction(function () use ($school) {
            $school->address()->delete();
            $school->principal()->delete();

            $school->teachers()->delete();
            $school->classrooms()->delete();
            $school->delete();
        });

        return redirect(route('schools.index'));
    }

    public function show(School $school): \Inertia\Response
    {
        return inertia::render('schools/show')->with([
            'school' => new SchoolResource($school->load([
                'classrooms.teacher',
                'principal',
                'address',
                'user',
            ])),
        ]);
    }
}
