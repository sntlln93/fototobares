<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\ProductionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ReorderProductionStatusesRequest extends FormRequest
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
            'product_type_id' => ['required', 'integer', 'exists:product_types,id'],
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }

    /**
     * The reorder must include every stage of the type, and nothing else.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $currentIds = ProductionStatus::query()
                    ->where('product_type_id', $this->integer('product_type_id'))
                    ->pluck('id')
                    ->sort()
                    ->values()
                    ->all();

                $orderedIds = collect($this->array('ordered_ids'))
                    ->map(fn ($id) => intval($id))
                    ->sort()
                    ->values()
                    ->all();

                if ($currentIds !== $orderedIds) {
                    $validator->errors()->add(
                        'ordered_ids',
                        'El orden enviado no coincide con las etapas del tipo de producto.',
                    );
                }
            },
        ];
    }
}
