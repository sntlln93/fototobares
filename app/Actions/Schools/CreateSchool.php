<?php

declare(strict_types=1);

namespace App\Actions\Schools;

use App\Contracts\ActionContract;
use App\Enums\ContactRole;
use App\Models\School;
use Illuminate\Support\Facades\DB;

class CreateSchool implements ActionContract
{
    /**
     * Create a school with its optional principal and its address.
     *
     * @param  array<string, mixed>  $params  validated school payload
     */
    public function handle(array $params): void
    {
        DB::transaction(function () use ($params) {
            /** @var array<string, mixed> $schoolData */
            $schoolData = $params['school'];
            $school = School::create($schoolData);

            if (isset($params['principal'])) {
                /** @var array<string, mixed> $principalData */
                $principalData = $params['principal'];
                $school->principal()->create([
                    ...$principalData,
                    'role' => ContactRole::Principal,
                ]);
            }

            /** @var array<string, mixed> $addressData */
            $addressData = $params['address'];
            $school->address()->create($addressData);
        });
    }
}
