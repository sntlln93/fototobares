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
            'unit_price' => ['required', 'numeric', 'min:1000'],
            'max_payments' => ['required', 'numeric'],
            'type' => ['required', 'string', 'in:taza,mural,banda,medalla'],
        ];

        if ($this->type === 'mural') {
            return array_merge($base_rules, [
                'variants' => ['required', 'array'],

                'variants.photo_types' => ['required', 'array', 'min:1'],
                'variants.photo_types.*' => ['string', 'in:grupo,individual'],

                'variants.orientations' => ['required', 'array', 'min:1'],
                'variants.orientations.*' => ['string', 'in:vertical,horizontal'],

                'variants.backgrounds' => ['required', 'array', 'min:1'],
                'variants.backgrounds.*' => ['string', 'in:blanco,negro,azul,rosa'],

                'variants.colors' => ['required', 'array', 'min:1'],
                'variants.colors.*' => ['string', 'in:blanco,negro,azul,rosa'],

                'variants.dimentions' => ['required', 'regex:/^\d+x\d+$/'],
            ]);
        }

        return $base_rules;
    }
}
