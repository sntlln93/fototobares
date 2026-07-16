<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\EditorAssignments\BulkEditorAssignmentData;
use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BulkAssignEditorRequest extends FormRequest
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
            'editor_id' => [
                'required',
                'integer',
                'exists:users,id',
                $this->assignableEditor(...),
                $this->notSelfAssigned(...),
            ],
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'school_id' => ['nullable', 'integer', 'exists:schools,id', 'required_without:classroom_id', 'prohibits:classroom_id'],
            'classroom_id' => ['nullable', 'integer', 'exists:classrooms,id', 'required_without:school_id', 'prohibits:school_id'],
        ];
    }

    private function assignableEditor(string $attribute, mixed $value, Closure $fail): void
    {
        $editor = User::query()->whereKey($value)->first();

        if ($editor === null || ! $editor->hasAnyRole(UserRole::Editor, UserRole::Admin)) {
            $fail('El usuario seleccionado no puede ser asignado como editor.');
        }
    }

    private function notSelfAssigned(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_numeric($value)) {
            return;
        }

        /** @var User $user */
        $user = $this->user();

        if ((int) $value === $user->id) {
            $fail('No podés asignarte a vos mismo.');
        }
    }

    public function toData(): BulkEditorAssignmentData
    {
        /** @var array{editor_id: int|string, school_id?: int|string|null, classroom_id?: int|string|null, product_ids: list<int|string>} $validated */
        $validated = $this->validated();

        /** @var User $user */
        $user = $this->user();

        return new BulkEditorAssignmentData(
            editorId: (int) $validated['editor_id'],
            assignedBy: (int) $user->id,
            schoolId: isset($validated['school_id']) ? (int) $validated['school_id'] : null,
            classroomId: isset($validated['classroom_id']) ? (int) $validated['classroom_id'] : null,
            productIds: array_map(fn ($id) => (int) $id, $validated['product_ids']),
        );
    }
}
