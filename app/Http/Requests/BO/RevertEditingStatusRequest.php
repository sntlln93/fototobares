<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\EditingStatus\RevertEditingStatusData;
use App\Models\OrderDetail;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RevertEditingStatusRequest extends FormRequest
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
        return [];
    }

    public function toData(): RevertEditingStatusData
    {
        /** @var OrderDetail $orderDetail */
        $orderDetail = $this->route('orderDetail');

        /** @var User $user */
        $user = $this->user();

        return new RevertEditingStatusData(
            orderDetailId: (int) $orderDetail->id,
            revertedById: (int) $user->id,
        );
    }
}
