<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Enums\ContactRole;
use App\Models\School;
use Illuminate\Support\Facades\DB;

class UpdateSchool implements ActionContract
{
    /**
     * Update a school, creating or updating its principal as needed and
     * updating its address.
     *
     * @param  array<string, mixed>  $params  {school: School, data: array<string, mixed>}
     */
    public function handle(array $params): void
    {
        /** @var School $school */
        $school = $params['school'];

        /** @var array<string, mixed> $data */
        $data = $params['data'];

        DB::transaction(function () use ($school, $data) {
            /** @var array<string, mixed> $schoolData */
            $schoolData = $data['school'];
            $school->update($schoolData);

            if (isset($data['principal'])) {
                /** @var array<string, mixed> $principalData */
                $principalData = $data['principal'];

                if (! $school->principal) {
                    $school->principal()->create([
                        ...$principalData,
                        'role' => ContactRole::Principal,
                    ]);
                } else {
                    $school->principal()->update($principalData);
                }
            }

            /** @var array<string, mixed> $addressData */
            $addressData = $data['address'];
            $school->address()->update($addressData);
        });
    }
}
