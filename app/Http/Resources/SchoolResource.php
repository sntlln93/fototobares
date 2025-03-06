<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'full_address' => (string) $this->address,
            'classrooms' => ClassroomResource::collection($this->classrooms),
            'user_id' => $this->user_id,
            'user' => $this->user,
        ];
    }
}
