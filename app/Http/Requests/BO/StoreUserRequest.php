<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Users\CreateUserData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ];
    }

    public function toData(): CreateUserData
    {
        /** @var array{name: string, email: string, password: string, roles: list<int|string>} $validated */
        $validated = $this->validated();

        return new CreateUserData(
            name: $validated['name'],
            email: $validated['email'],
            password: $validated['password'],
            roles: array_map(fn ($id) => (int) $id, $validated['roles']),
        );
    }
}
