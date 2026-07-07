<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\Photo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\delete;
use function Pest\Laravel\post;

it('parses the photo number from the filename', function () {
    Storage::fake('public');
    actingAsRole(UserRole::Editor);

    $classroom = Classroom::factory()->create();

    post(route('photos.store', $classroom), [
        'photo' => UploadedFile::fake()->image('012.jpg'),
    ])->assertSessionHasNoErrors();

    $photo = Photo::where('classroom_id', $classroom->id)->first();

    expect($photo?->number)->toBe(12);
    Storage::disk('public')->assertExists($photo->file_path);
});

it('rejects a duplicated photo number in the classroom', function () {
    Storage::fake('public');
    actingAsRole(UserRole::Editor);

    $classroom = Classroom::factory()->create();
    Photo::factory()->create(['classroom_id' => $classroom->id, 'number' => 12]);

    post(route('photos.store', $classroom), [
        'photo' => UploadedFile::fake()->image('foto_012.jpg'),
    ])->assertSessionHasErrors('photo');
});

it('rejects a filename without a number', function () {
    Storage::fake('public');
    actingAsRole(UserRole::Editor);

    $classroom = Classroom::factory()->create();

    post(route('photos.store', $classroom), [
        'photo' => UploadedFile::fake()->image('retrato.jpg'),
    ])->assertSessionHasErrors('photo');
});

it('renumbers the remaining photos after deleting one', function () {
    Storage::fake('public');
    actingAsRole(UserRole::Editor);

    $classroom = Classroom::factory()->create();

    [$first, $second, $third] = collect([1, 2, 3])->map(
        fn (int $number) => Photo::factory()->create([
            'classroom_id' => $classroom->id,
            'number' => $number,
        ]),
    )->all();

    delete(route('photos.destroy', $second))->assertSessionHasNoErrors();

    expect(Photo::find($second->id))->toBeNull()
        ->and($first->refresh()->number)->toBe(1)
        ->and($third->refresh()->number)->toBe(2);
});
