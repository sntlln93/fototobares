<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\ProductionStatuses\CreateProductionStatusData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductionStatusRequest extends FormRequest
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
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('production_statuses')
                    ->where('product_id', $this->integer('product_id')),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Ya existe una etapa con ese nombre para este producto.',
        ];
    }

    public function toData(): CreateProductionStatusData
    {
        /** @var array{product_id: int|string, name: string} $validated */
        $validated = $this->validated();

        return new CreateProductionStatusData(
            productId: (int) $validated['product_id'],
            name: $validated['name'],
        );
    }
}
