<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Models\Classroom;
use Illuminate\Support\Facades\DB;

class DeleteClassroom implements ActionContract
{
    /**
     * Delete a classroom and its teacher contact. The caller guards against
     * classrooms that still have orders.
     *
     * @param  array<string, mixed>  $params  {classroom: Classroom}
     */
    public function handle(array $params): void
    {
        /** @var Classroom $classroom */
        $classroom = $params['classroom'];

        DB::transaction(function () use ($classroom) {
            $classroom->teacher()->delete();
            $classroom->delete();
        });
    }
}
