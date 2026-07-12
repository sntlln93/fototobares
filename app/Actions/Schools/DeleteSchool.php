<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Models\School;
use Illuminate\Support\Facades\DB;

class DeleteSchool implements ActionContract
{
    /**
     * Delete a school along with its address, principal, teachers and
     * classrooms. The caller guards against schools that still have orders.
     *
     * @param  array<string, mixed>  $params  {school: School}
     */
    public function handle(array $params): void
    {
        /** @var School $school */
        $school = $params['school'];

        DB::transaction(function () use ($school) {
            $school->address()->delete();
            $school->principal()->delete();

            $school->teachers()->delete();
            $school->classrooms()->delete();
            $school->delete();
        });
    }
}
