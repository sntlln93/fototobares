<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required'],
            'suggested_price' => ['required', 'numeric', 'min:1'],
            'suggested_max_payments' => ['required', 'numeric', 'min:1'],
            'products' => ['required', 'array'],
            'products.*.id' => ['required', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
            'products.*.variants' => ['sometimes'],
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
     *     suggested_max_payments: int,
     *     products: array<int, array{
     *         id: int,
     *         quantity: int,
     *         variants?: string,
     *     }>
     * }
     */
    public function validated($key = null, $default = null): array
    {
        /** @var array{
         *     name: string,
         *     suggested_price: float,
         *     suggested_max_payments: int,
         *     products: array<int, array{
         *         id: int,
         *         quantity: int,
         *         variants?: string,
         *     }>
         * }
         */
        $validated = parent::validated($key, $default);

        return $validated;
    }
}
