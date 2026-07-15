<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Combos\ComboData;
use App\Data\Combos\ComboProductData;
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

    public function toData(): ComboData
    {
        /** @var array{
         *     name: string,
         *     suggested_price: int|float|string,
         *     default_payments: int|float|string,
         *     products: list<array{
         *         id: int|string,
         *         quantity: int|string,
         *         subtract_value: int|string,
         *         variants?: array<string, mixed>|null,
         *     }>
         * } $validated
         */
        $validated = $this->validated();

        return new ComboData(
            name: $validated['name'],
            suggestedPrice: (float) $validated['suggested_price'],
            defaultPayments: (int) $validated['default_payments'],
            products: array_map(
                fn (array $product) => new ComboProductData(
                    id: (int) $product['id'],
                    quantity: (int) $product['quantity'],
                    subtractValue: (int) $product['subtract_value'],
                    variants: $product['variants'] ?? null,
                ),
                $validated['products'],
            ),
        );
    }
}
