<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Classrooms\CreateClassroomData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:10'],
            'school_id' => ['required', 'exists:schools,id'],
            'teacher' => ['nullable', 'string', 'min:4', 'max:30'],
            'phone' => ['nullable', 'numeric'],
        ];
    }

    public function toData(): CreateClassroomData
    {
        /** @var array{name: string, school_id: int|string, teacher: string|null, phone: int|string|null} $validated */
        $validated = $this->validated();

        return new CreateClassroomData(
            name: $validated['name'],
            schoolId: (int) $validated['school_id'],
            teacher: $validated['teacher'],
            phone: $validated['phone'],
        );
    }
}
