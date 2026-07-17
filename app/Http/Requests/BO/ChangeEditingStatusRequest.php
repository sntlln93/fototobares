<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\EditingStatus\EditingStatusChangeData;
use App\Enums\EditingStatus;
use App\Models\OrderDetail;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeEditingStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(EditingStatus::class)],
        ];
    }

    public function toData(): EditingStatusChangeData
    {
        /** @var array{status: string} $validated */
        $validated = $this->validated();

        /** @var OrderDetail $orderDetail */
        $orderDetail = $this->route('orderDetail');

        /** @var User $user */
        $user = $this->user();

        return new EditingStatusChangeData(
            orderDetailId: (int) $orderDetail->id,
            target: EditingStatus::from($validated['status']),
            changedById: (int) $user->id,
        );
    }
}
