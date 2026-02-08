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

        // Parse the number from the filename
        $originalFilename = $validated['photo']->getClientOriginalName();
        
        // Extract number from filename (e.g., "001.jpg" -> 1, "photo_042.png" -> 42)
        if (preg_match('/(\d+)/', $originalFilename, $matches)) {
            $photoNumber = (int) $matches[1];
        } else {
            return back()->withErrors(['photo' => 'El nombre del archivo debe contener un número (ej: 001.jpg, foto_025.png)']);
        }

        // Check if this number already exists for this classroom
        $existingPhoto = Photo::where('classroom_id', $classroom->id)
            ->where('number', $photoNumber)
            ->first();

        if ($existingPhoto) {
            return back()->withErrors(['photo' => "Ya existe una foto con el número {$photoNumber} en este curso"]);
        }

        // Store the photo
        $path = $validated['photo']->store("photos/classroom-{$classroom->id}", 'public');

        // Create photo record
        Photo::create([
            'classroom_id' => $classroom->id,
            'file_path' => $path,
            'number' => $photoNumber,
        ]);

        return back()->with('success', "Foto #{$photoNumber} subida correctamente");
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
