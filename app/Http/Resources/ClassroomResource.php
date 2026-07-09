<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Classroom
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
                /** @var \App\Models\School $school */
                $school = $this->school;

                return [
                    'id' => $school->id,
                    'name' => $school->name,
                ];
            }),
        ];
    }
}
