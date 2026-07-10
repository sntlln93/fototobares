<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\ProductionStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductionStatusStockableRequest extends FormRequest
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
            'stockable_id' => ['required', 'integer', 'exists:stockables,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * A stockable can be consumed by at most one stage of a product,
     * so the deduction stays idempotent per (detail, stockable).
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

                /** @var ProductionStatus $status */
                $status = $this->route('productionStatus');

                $conflict = ProductionStatus::query()
                    ->where('product_id', $status->product_id)
                    ->whereKeyNot($status->id)
                    ->whereHas('stockables', fn ($query) => $query
                        ->where('stockables.id', $this->integer('stockable_id')))
                    ->first();

                if ($conflict !== null) {
                    $validator->errors()->add(
                        'stockable_id',
                        "Este insumo ya se consume en la etapa \"{$conflict->name}\" de este producto.",
                    );
                }
            },
        ];
    }
}
