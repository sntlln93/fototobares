<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StorePhotoRequest;
use App\Models\Classroom;
use App\Models\Photo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PhotoController extends Controller
{
    public function index(Classroom $classroom): Response
    {
        $photos = Photo::where('classroom_id', $classroom->id)
            ->orderBy('number')
            ->get();

        return Inertia::render('photos/index', [
            'classroom' => $classroom->load('school'),
            'photos' => $photos,
        ]);
    }

    public function store(StorePhotoRequest $request, Classroom $classroom): RedirectResponse
    {
        /** @var UploadedFile $photo */
        $photo = $request->file('photo');

        // Extract number from filename (e.g., "001.jpg" -> 1, "photo_042.png" -> 42)
        if (! preg_match('/(\d+)/', $photo->getClientOriginalName(), $matches)) {
            return back()->withErrors(['photo' => 'El nombre del archivo debe contener un número (ej: 001.jpg, foto_025.png)']);
        }

        $photoNumber = (int) $matches[1];

        // Reject a number already used in this classroom
        $existingPhoto = Photo::where('classroom_id', $classroom->id)
            ->where('number', $photoNumber)
            ->first();

        if ($existingPhoto) {
            return back()->withErrors(['photo' => "Ya existe una foto con el número {$photoNumber} en este curso"]);
        }

        $path = $photo->store("photos/classroom-{$classroom->id}", 'public');

        Photo::create([
            'classroom_id' => $classroom->id,
            'file_path' => $path,
            'number' => $photoNumber,
        ]);

        return back()->with('success', "Foto #{$photoNumber} subida correctamente");
    }

    public function destroy(Photo $photo): RedirectResponse
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
