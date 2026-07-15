<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Classrooms\UpdateClassroomData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<UpdateClassroomData>
 */
class UpdateClassroom implements ActionContract
{
    /**
     * Rename a classroom and, when teacher data is provided, update its
     * teacher contact.
     *
     * @param  UpdateClassroomData  $params
     */
    public function handle(DtoContract $params): void
    {
        DB::transaction(function () use ($params) {
            $params->classroom->update([
                'name' => $params->name,
            ]);

            if ($params->teacher !== null || $params->phone !== null) {
                $params->classroom->teacher()->update([
                    'name' => $params->teacher,
                    'phone' => $params->phone,
                ]);
            }
        });
    }
}
