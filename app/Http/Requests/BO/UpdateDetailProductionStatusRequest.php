<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Orders\SetDetailProductionStatusData;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDetailProductionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * A null production_status_id means "sin empezar": the detail enters (or
     * returns to) the pending state that precedes the product's stage chain.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'detail_id' => ['required', 'integer'],
            'production_status_id' => ['nullable', 'integer', 'exists:production_statuses,id'],
        ];
    }

    public function toData(Order $order, ?User $user): SetDetailProductionStatusData
    {
        /** @var array{detail_id: int|string, production_status_id: int|string|null} $validated */
        $validated = $this->validated();

        return new SetDetailProductionStatusData(
            order: $order,
            detailId: (int) $validated['detail_id'],
            statusId: isset($validated['production_status_id']) ? (int) $validated['production_status_id'] : null,
            user: $user,
        );
    }
}
