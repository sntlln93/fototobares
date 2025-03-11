<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'school.user_id' => ['required', 'exists:users,id'],
            'school' => ['required'],
            'school.name' => ['required'],
            'school.level' => ['required'],
            'principal' => ['nullable'],
            'principal.name' => ['sometimes'],
            'principal.phone' => ['present_with:principal.name', 'numeric'],
            'address' => ['required'],
            'address.street' => ['sometimes'],
            'address.number' => ['sometimes'],
            'address.neighborhood' => ['sometimes'],
            'address.city' => ['required'],
        ];
    }

    /**
     * Get the validated data as a structured array.
     *
     * @param  string|null  $key
     * @param  mixed  $default
     * @return array{
     *     school: array{
     *         user_id: int,
     *         name: string,
     *         level: string,
     *     },
     *     principal?: array{
     *         name?: string,
     *         phone?: string,
     *     },
     *     address: array{
     *         street?: string,
     *         number?: string,
     *         neighborhood?: string,
     *         city: string,
     *     }
     * }
     */
    public function validated($key = null, $default = null): array
    {
        /** @var array{
         *     school: array{
         *         user_id: int,
         *         name: string,
         *         level: string,
         *     },
         *     principal?: array{
         *         name?: string,
         *         phone?: string,
         *     },
         *     address: array{
         *         street?: string,
         *         number?: string,
         *         neighborhood?: string,
         *         city: string,
         *     }
         * } $validated
         */
        $validated = parent::validated($key, $default);

        return $validated;
    }
}
