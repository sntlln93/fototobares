<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\EditorAssignments\EditorAssignmentData;
use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignEditorRequest extends FormRequest
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
            'order_detail_id' => ['required', 'integer', 'exists:order_details,id'],
            'editor_id' => [
                'required',
                'integer',
                'exists:users,id',
                $this->assignableEditor(...),
                $this->notSelfAssigned(...),
            ],
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

    public function toData(): EditorAssignmentData
    {
        /** @var array{order_detail_id: int|string, editor_id: int|string} $validated */
        $validated = $this->validated();

        /** @var User $user */
        $user = $this->user();

        return new EditorAssignmentData(
            orderDetailId: (int) $validated['order_detail_id'],
            editorId: (int) $validated['editor_id'],
            assignedBy: (int) $user->id,
        );
    }
}
