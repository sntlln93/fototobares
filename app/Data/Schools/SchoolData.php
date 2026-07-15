<?php

declare(strict_types=1);

namespace App\Data\Schools;

use App\Contracts\DtoContract;

/**
 * Shared payload for CreateSchool and UpdateSchool (both fed by
 * StoreSchoolRequest). The Actions forward each sub-array wholesale to the
 * corresponding model's create()/update(), so they stay plain arrays here
 * rather than nested DTOs.
 */
final readonly class SchoolData implements DtoContract
{
    /**
     * @param  array{user_id: int|string, name: string, level: string}  $school
     * @param  array{name?: string, phone?: int|string}|null  $principal
     * @param  array{street?: string, number?: string, neighborhood?: string, city: string}  $address
     */
    public function __construct(
        public array $school,
        public ?array $principal,
        public array $address,
    ) {}
}
