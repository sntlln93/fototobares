<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\School
 */
class SchoolResource extends JsonResource
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
            'name' => $this->name,
            'level' => $this->level,
            'principal' => new ContactResource($this->principal),
            'full_address' => $this->address?->full_address,
            'classrooms' => ClassroomResource::collection($this->classrooms),
            'user_id' => $this->user_id,
            'user' => $this->user,
        ];
    }
}
