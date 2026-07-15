<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Classrooms\ClassroomCreationData;
use App\Enums\ContactRole;
use App\Models\Classroom;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ClassroomCreationData>
 */
class CreateClassroomAction implements ActionContract
{
    /**
     * Create a classroom and, when teacher data is provided, its teacher
     * contact.
     *
     * @param  ClassroomCreationData  $params
     */
    public function handle(DtoContract $params): void
    {
        DB::transaction(function () use ($params) {
            $classroom = Classroom::create([
                'name' => $params->name,
                'school_id' => $params->schoolId,
            ]);

            if ($params->teacher !== null || $params->phone !== null) {
                $classroom->teacher()->create([
                    'name' => $params->teacher,
                    'phone' => $params->phone,
                    'role' => ContactRole::Teacher,
                ]);
            }
        });
    }
}
