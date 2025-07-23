<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    const MURAL_PRODUCT_TYPE_ID = 1;

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
        $base_rules = [
            'name' => ['required', 'string'],
            'unit_price' => ['required', 'numeric', 'min:1'],
            'max_payments' => ['required', 'numeric', 'min:1'],
            'product_type_id' => ['required', 'exists:product_types,id'],
        ];

        /** @var string $product_type_id */
        $product_type_id = request('product_type_id');

        if ((int) $product_type_id === self::MURAL_PRODUCT_TYPE_ID) {
            return array_merge($base_rules, [
                'variants' => ['required', 'array'],

                'variants.photo_types' => ['required', 'array', 'min:1'],
                'variants.photo_types.*' => ['string', 'in:grupo,individual'],

                'variants.orientations' => ['required', 'array', 'min:1'],
                'variants.orientations.*' => ['string', 'in:vertical,horizontal'],

                'variants.backgrounds' => ['required', 'array', 'min:1'],
                'variants.backgrounds.*' => ['string', 'in:white,black,blue,pink'],

                'variants.colors' => ['required', 'array', 'min:1'],
                'variants.colors.*' => ['string', 'in:white,black,blue,pink'],

                'variants.dimentions' => ['required', 'regex:/^\d+x\d+$/'],
            ]);
        }

        return $base_rules;
    }

    /**
     * Get the validated data as a structured array.
     *
     * @return array{
     *     name: string,
     *     unit_price: float,
     *     max_payments: int,
     *     product_type_id: int,
     *     variants?: array{
     *         photo_types: array<string>,
     *         orientations: array<string>,
     *         backgrounds: array<string>,
     *         colors: array<string>,
     *         dimentions: string
     *     }
     * }
     */
    public function validated($key = null, $default = null)
    {

        /**
         * @var array{
         *     name: string,
         *     unit_price: float,
         *     max_payments: int,
         *     product_type_id: int,
         *     variants?: array{
         *         photo_types: array<string>,
         *         orientations: array<string>,
         *         backgrounds: array<string>,
         *         colors: array<string>,
         *         dimentions: string
         *     }
         * }
         */
        $validated = parent::validated();

        return $validated;
    }
}
