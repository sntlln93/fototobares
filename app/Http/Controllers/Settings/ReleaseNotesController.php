<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class ReleaseNotesController extends Controller
{
    public function show(): Response
    {
        $releaseNotesDir = base_path('release-notes');
        $files = File::files($releaseNotesDir);

        // Find the latest release_notes file
        $releaseNotesFile = collect($files)
            ->filter(fn ($file) => str_contains($file->getFilename(), 'release_notes') || str_ends_with($file->getFilename(), '.md'))
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->first();

        $content = '';
        if ($releaseNotesFile) {
            $content = File::get($releaseNotesFile->getPathname());
        }

        return Inertia::render('settings/release-notes', [
            'content' => $content,
        ]);
    }
}
