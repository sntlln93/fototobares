<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Deliveries\MarkDeliveriesData;
use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'detail_ids' => ['required', 'array', 'min:1'],
            'detail_ids.*' => ['required', 'integer'],
            'action' => ['required', 'in:deliver,undeliver'],
        ];
    }

    public function toData(Order $order): MarkDeliveriesData
    {
        /** @var array{detail_ids: list<int|string>, action: string} $validated */
        $validated = $this->validated();

        return new MarkDeliveriesData(
            order: $order,
            detailIds: array_map(fn ($id) => (int) $id, $validated['detail_ids']),
            action: $validated['action'],
        );
    }
}
