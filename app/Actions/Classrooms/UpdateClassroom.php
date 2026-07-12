<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Models\Classroom;
use Illuminate\Support\Facades\DB;

class UpdateClassroom implements ActionContract
{
    /**
     * Rename a classroom and, when teacher data is provided, update its
     * teacher contact.
     *
     * @param  array<string, mixed>  $params  {classroom: Classroom, data: array<string, mixed>}
     */
    public function handle(array $params): void
    {
        /** @var Classroom $classroom */
        $classroom = $params['classroom'];

        /** @var array<string, mixed> $data */
        $data = $params['data'];

        DB::transaction(function () use ($classroom, $data) {
            $classroom->update([
                'name' => $data['name'],
            ]);

            if ($data['teacher'] !== null || $data['phone'] !== null) {
                $classroom->teacher()->update([
                    'name' => $data['teacher'],
                    'phone' => $data['phone'],
                ]);
            }
        });
    }
}
