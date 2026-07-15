<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Data\Schools\SchoolData;
use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
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

    public function toData(): SchoolData
    {
        /** @var array{
         *     school: array{
         *         user_id: int|string,
         *         name: string,
         *         level: string,
         *     },
         *     principal?: array{
         *         name?: string,
         *         phone?: int|string,
         *     },
         *     address: array{
         *         street?: string,
         *         number?: string,
         *         neighborhood?: string,
         *         city: string,
         *     }
         * } $validated
         */
        $validated = $this->validated();

        return new SchoolData(
            school: $validated['school'],
            principal: $validated['principal'] ?? null,
            address: $validated['address'],
        );
    }
}
