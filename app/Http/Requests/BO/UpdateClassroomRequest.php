<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Classrooms\ClassroomUpdateData;
use App\Models\Classroom;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClassroomRequest extends FormRequest
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
            'teacher' => ['nullable', 'string', 'min:4', 'max:30'],
            'phone' => ['nullable', 'numeric'],
        ];
    }

    public function toData(Classroom $classroom): ClassroomUpdateData
    {
        /** @var array{name: string, teacher: string|null, phone: int|string|null} $validated */
        $validated = $this->validated();

        return new ClassroomUpdateData(
            classroom: $classroom,
            name: $validated['name'],
            teacher: $validated['teacher'],
            phone: $validated['phone'],
        );
    }
}
