<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PhotoController extends Controller
{
    public function index(Classroom $classroom): \Inertia\Response
    {
        $photos = Photo::where('classroom_id', $classroom->id)
            ->orderBy('number')
            ->get();

        return Inertia::render('photos/index', [
            'classroom' => $classroom->load('school'),
            'photos' => $photos,
        ]);
    }

    public function store(Request $request, Classroom $classroom): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'], // 5MB
        ]);

        // Get the next number in sequence
        /** @var int|null $lastNumber */
        $lastNumber = Photo::where('classroom_id', $classroom->id)
            ->max('number');

        $nextNumber = ($lastNumber ?? 0) + 1;

        // Store the photo
        $path = $validated['photo']->store("photos/classroom-{$classroom->id}", 'public');

        // Create photo record
        Photo::create([
            'classroom_id' => $classroom->id,
            'file_path' => $path,
            'number' => $nextNumber,
        ]);

        return back()->with('success', "Foto #{$nextNumber} subida correctamente");
    }

    public function destroy(Photo $photo): \Illuminate\Http\RedirectResponse
    {
        $classroomId = $photo->classroom_id;

        // Delete the file
        if (Storage::disk('public')->exists($photo->file_path)) {
            Storage::disk('public')->delete($photo->file_path);
        }

        // Delete the record
        $photo->delete();

        // Re-number remaining photos
        $photos = Photo::where('classroom_id', $classroomId)
            ->orderBy('number')
            ->get();

        foreach ($photos as $index => $p) {
            $p->update(['number' => $index + 1]);
        }

        return back()->with('success', 'Foto eliminada y numeración actualizada');
    }
}
