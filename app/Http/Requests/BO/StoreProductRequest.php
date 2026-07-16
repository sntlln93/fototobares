<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Products\ProductCreationData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'unit_price' => ['required', 'numeric', 'min:1'],
            'max_payments' => ['required', 'numeric', 'min:1'],
            'product_type_id' => ['required', 'exists:product_types,id'],
            'has_photo' => ['sometimes', 'boolean'],

            'variants' => ['sometimes', 'nullable', 'array'],
            'variants.*.label' => ['required', 'string', 'max:50', 'distinct'],
            'variants.*.type' => ['required', 'string', 'in:text,color'],
            'variants.*.nullable' => ['required', 'boolean'],
            'variants.*.options' => ['required', 'array', 'min:1'],
            'variants.*.options.*.label' => ['required', 'string', 'max:50'],
            'variants.*.options.*.color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ];
    }

    /**
     * Cross-field checks wildcard rules can't express: option labels unique
     * within their own definition (distinct only compares siblings at the
     * same nesting level, not per-parent) and a color required once the
     * definition's type is "color".
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var array<int, array{label?: string, type?: string, options?: array<int, array{label?: string, color?: string|null}>}> $definitions */
            $definitions = $this->input('variants') ?? [];

            foreach ($definitions as $index => $definition) {
                $optionLabels = array_column($definition['options'] ?? [], 'label');

                if (count($optionLabels) !== count(array_unique($optionLabels))) {
                    $validator->errors()->add("variants.{$index}.options", 'Las opciones de esta variante no pueden repetirse.');
                }

                if (($definition['type'] ?? null) === 'color') {
                    foreach ($definition['options'] ?? [] as $optionIndex => $option) {
                        if (empty($option['color'])) {
                            $validator->errors()->add("variants.{$index}.options.{$optionIndex}.color", 'El color es requerido para esta opción.');
                        }
                    }
                }
            }
        });
    }

    public function toData(): ProductCreationData
    {
        /** @var array{
         *     name: string,
         *     unit_price: int|float|string,
         *     max_payments: int|float|string,
         *     product_type_id: int|string,
         *     has_photo?: bool,
         *     variants?: array<int, array{
         *         label: string,
         *         type: string,
         *         nullable: bool,
         *         options: array<int, array{label: string, color?: string|null}>
         *     }>|null
         * } $validated
         */
        $validated = $this->validated();

        return new ProductCreationData(
            name: $validated['name'],
            unitPrice: (float) $validated['unit_price'],
            maxPayments: (int) $validated['max_payments'],
            productTypeId: (int) $validated['product_type_id'],
            variants: $validated['variants'] ?? null,
            hasPhoto: (bool) ($validated['has_photo'] ?? false),
        );
    }
}
