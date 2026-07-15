<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\ProductionStatuses\ProductionStatusesReorderingData;
use App\Models\ProductionStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }

    /**
     * The reorder must include every stage of the product, and nothing else.
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
                    ->where('product_id', $this->integer('product_id'))
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
                        'El orden enviado no coincide con las etapas del producto.',
                    );
                }
            },
        ];
    }

    public function toData(): ProductionStatusesReorderingData
    {
        /** @var array{product_id: int|string, ordered_ids: list<int|string>} $validated */
        $validated = $this->validated();

        return new ProductionStatusesReorderingData(
            productId: (int) $validated['product_id'],
            orderedIds: array_map(fn ($id) => (int) $id, $validated['ordered_ids']),
        );
    }
}
