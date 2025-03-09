<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\ContactRole;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassroomController extends Controller
{
    public function destroy(Classroom $classroom)
    {
        $school_id = $classroom->school_id;

        DB::transaction(function () use ($classroom) {
            $classroom->teacher()->delete();
            $classroom->delete();
        });

        return redirect()->route('schools.show', ['school' => $school_id]);
    }

    public function update(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:10'],
            'teacher' => ['required', 'string', 'min:4', 'max:30'],
            'phone' => ['required', 'numeric'],
        ]);

        DB::transaction(function () use ($classroom, $validated) {
            $classroom->update([
                'name' => $validated['name'],
            ]);

            $classroom->teacher()->update([
                'name' => $validated['teacher'],
                'phone' => $validated['phone'],
            ]);
        });

        return redirect(to: route('schools.show', [
            'school' => $classroom->school_id,
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:10'],
            'school_id' => ['required', 'exists:schools,id'],
            'teacher' => ['required', 'string', 'min:4', 'max:30'],
            'phone' => ['required', 'numeric'],
        ]);

        DB::transaction(function () use ($validated) {
            $classroom = Classroom::create([
                'name' => $validated['name'],
                'school_id' => $validated['school_id'],
            ]);

            $classroom->teacher()->create([
                'name' => $validated['teacher'],
                'phone' => $validated['phone'],
                'role' => ContactRole::Teacher,
            ]);
        });

        return redirect(to: route('schools.show', [
            'school' => $request->school_id,
        ]));
    }
}
