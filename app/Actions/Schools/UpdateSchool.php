<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Schools\UpdateSchoolData;
use App\Enums\ContactRole;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<UpdateSchoolData>
 */
class UpdateSchool implements ActionContract
{
    /**
     * Update a school, creating or updating its principal as needed and
     * updating its address.
     *
     * @param  UpdateSchoolData  $params
     */
    public function handle(DtoContract $params): void
    {
        $school = $params->school;
        $data = $params->data;

        DB::transaction(function () use ($school, $data) {
            $school->update($data->school);

            if ($data->principal !== null) {
                if (! $school->principal) {
                    $school->principal()->create([
                        ...$data->principal,
                        'role' => ContactRole::Principal,
                    ]);
                } else {
                    $school->principal()->update($data->principal);
                }
            }

            $school->address()->update($data->address);
        });
    }
}
