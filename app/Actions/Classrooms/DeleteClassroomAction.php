<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Classrooms\ClassroomDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ClassroomDeletionData>
 */
class DeleteClassroomAction implements ActionContract
{
    /**
     * Delete a classroom and its teacher contact. The caller guards against
     * classrooms that still have orders.
     *
     * @param  ClassroomDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $classroom = $params->classroom;

        DB::transaction(function () use ($classroom) {
            $classroom->teacher()->delete();
            $classroom->delete();
        });
    }
}
