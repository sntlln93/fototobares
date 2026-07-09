<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\ProductionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductionStatusRequest extends FormRequest
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
        /** @var ProductionStatus $status */
        $status = $this->route('productionStatus');

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('production_statuses')
                    ->where('product_id', $status->product_id)
                    ->ignore($status->id),
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
}
