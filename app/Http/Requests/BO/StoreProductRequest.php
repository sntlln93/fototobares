<?php

namespace App\Http\Requests\BO;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
        $base_rules = [
            'name' => ['required', 'string'],
            'unit_price' => ['required', 'numeric', 'min:1'],
            'max_payments' => ['required', 'numeric', 'min:1'],
            'product_type_id' => ['required', 'exists:product_types,id'],
        ];

        if ($this->product_type_id === 1) {
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
}
