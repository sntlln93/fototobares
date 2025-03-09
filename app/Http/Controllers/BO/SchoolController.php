<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\ContactRole;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\SchoolResource;
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

        $schools = School::with(['principal', 'classrooms', 'address', 'user'])
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

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'school.user_id' => ['required', 'exists:users,id'],
            'school' => ['required'],
            'school.name' => ['required'],
            'school.level' => ['required'],
            'principal' => ['sometimes'],
            'principal.name' => ['sometimes'],
            'principal.phone' => ['present_with:principal.name', 'numeric'],
            'address' => ['nullable'],
            'address.street' => ['sometimes'],
            'address.number' => ['sometimes'],
            'address.neighborhood' => ['sometimes'],
            'address.city' => ['required'],
        ]);

        DB::transaction(function () use ($validated) {
            $school = School::create($validated['school']);

            $school->principal()->create([
                ...$validated['principal'],
                'role' => ContactRole::Principal,
            ]);

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

    public function update(School $school, Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'school.user_id' => ['required', 'exists:users,id'],
            'school' => ['required'],
            'school.name' => ['required'],
            'school.level' => ['required'],
            'principal' => ['sometimes'],
            'principal.name' => ['sometimes'],
            'principal.phone' => ['present_with:principal.name', 'numeric'],
            'address' => ['nullable'],
            'address.street' => ['sometimes'],
            'address.number' => ['sometimes'],
            'address.neighborhood' => ['sometimes'],
            'address.city' => ['sometimes'],
        ]);

        DB::transaction(function () use ($validated, $school) {
            $school->update($validated['school']);

            $school->principal()->update($validated['principal']);

            $school->address()->update($validated['address']);
        });

        return redirect(route('schools.index'));

    }

    public function destroy(School $school): \Illuminate\Http\RedirectResponse
    {
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
