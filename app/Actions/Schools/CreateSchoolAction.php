<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Schools\SchoolData;
use App\Enums\ContactRole;
use App\Models\School;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<SchoolData>
 */
class CreateSchoolAction implements ActionContract
{
    /**
     * Create a school with its optional principal and its address.
     *
     * @param  SchoolData  $params
     */
    public function handle(DtoContract $params): void
    {
        DB::transaction(function () use ($params) {
            $school = School::create($params->school);

            if ($params->principal !== null) {
                $school->principal()->create([
                    ...$params->principal,
                    'role' => ContactRole::Principal,
                ]);
            }

            $school->address()->create($params->address);
        });
    }
}
