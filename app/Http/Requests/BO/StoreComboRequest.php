<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreComboRequest extends FormRequest
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
            'name' => ['required'],
            'suggested_price' => ['required', 'numeric', 'min:1'],
            'default_payments' => ['required', 'numeric', 'min:1'],
            'products' => ['required', 'array'],
            'products.*.id' => ['required', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'products.*.subtract_value' => ['required', 'integer', 'min:0'],
            'products.*.variants' => ['sometimes', 'nullable', 'array'],
        ];
    }

    /**
     * Get the validated data as a structured array.
     *
     * @param  string|null  $key
     * @param  mixed  $default
     * @return array{
     *     name: string,
     *     suggested_price: float,
     *     default_payments: int,
     *     products: array<int, array{
     *         id: int,
     *         quantity: int,
     *         subtract_value: int,
     *         variants?: array<string, mixed>|null,
     *     }>
     * }
     */
    public function validated($key = null, $default = null): array
    {
        /** @var array{
         *     name: string,
         *     suggested_price: float,
         *     default_payments: int,
         *     products: array<int, array{
         *         id: int,
         *         quantity: int,
         *         subtract_value: int,
         *         variants?: array<string, mixed>|null,
         *     }>
         * }
         */
        $validated = parent::validated($key, $default);

        return $validated;
    }
}
