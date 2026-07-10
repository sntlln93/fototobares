<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Classroom;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Classroom
 */
class ClassroomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => strtoupper($this->name),
            'teacher' => new ContactResource($this->teacher),
            'school' => $this->whenLoaded('school', function () {
                /** @var School $school */
                $school = $this->school;

                return [
                    'id' => $school->id,
                    'name' => $school->name,
                ];
            }),
        ];
    }
}
