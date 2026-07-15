<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Orders\DetailPrioritySettingData;
use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDetailPriorityRequest extends FormRequest
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
            'detail_id' => ['required', 'integer'],
            'priority' => ['required', 'boolean'],
        ];
    }

    public function toData(Order $order): DetailPrioritySettingData
    {
        /** @var array{detail_id: int|string, priority: bool} $validated */
        $validated = $this->validated();

        return new DetailPrioritySettingData(
            order: $order,
            detailId: (int) $validated['detail_id'],
            priority: (bool) $validated['priority'],
        );
    }
}
