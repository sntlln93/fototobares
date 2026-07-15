<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Users\UserUpdateData;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        /** @var User $user */
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ];
    }

    public function toData(User $user): UserUpdateData
    {
        /** @var array{name: string, email: string, password: string|null, roles: list<int|string>} $validated */
        $validated = $this->validated();

        return new UserUpdateData(
            user: $user,
            name: $validated['name'],
            email: $validated['email'],
            password: $validated['password'] ?: null,
            roles: array_map(fn ($id) => (int) $id, $validated['roles']),
        );
    }
}
