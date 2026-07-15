<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Tracking\DetailStageMovementData;
use App\Models\ProductionStatus;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BatchUpdateTrackingRequest extends FormRequest
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
            'detail_ids.*' => ['required', 'integer', 'exists:order_details,id'],
            'production_status_id' => ['required', 'integer', 'exists:production_statuses,id'],
        ];
    }

    public function toData(ProductionStatus $status, ?User $user): DetailStageMovementData
    {
        /** @var array{detail_ids: list<int|string>} $validated */
        $validated = $this->validated();

        return new DetailStageMovementData(
            detailIds: array_map(fn ($id) => (int) $id, $validated['detail_ids']),
            status: $status,
            user: $user,
        );
    }
}
