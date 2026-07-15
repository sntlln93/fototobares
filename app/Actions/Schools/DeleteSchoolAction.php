<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Schools\SchoolDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<SchoolDeletionData>
 */
class DeleteSchoolAction implements ActionContract
{
    /**
     * Delete a school along with its address, principal, teachers and
     * classrooms. The caller guards against schools that still have orders.
     *
     * @param  SchoolDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $school = $params->school;

        DB::transaction(function () use ($school) {
            $school->address()->delete();
            $school->principal()->delete();

            $school->teachers()->delete();
            $school->classrooms()->delete();
            $school->delete();
        });
    }
}
