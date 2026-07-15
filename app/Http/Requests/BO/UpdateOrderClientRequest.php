<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Orders\UpdateOrderClientData;
use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderClientRequest extends FormRequest
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
            'name' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'child_name' => ['nullable', 'string'],
            'attended_photo_session' => ['nullable', 'boolean'],
        ];
    }

    public function toData(Order $order): UpdateOrderClientData
    {
        /** @var array{
         *     name: string|null,
         *     phone: string|null,
         *     child_name: string|null,
         *     attended_photo_session: bool|int|string|null,
         * } $validated
         */
        $validated = $this->validated();

        return new UpdateOrderClientData(
            order: $order,
            name: $validated['name'],
            phone: $validated['phone'],
            childName: $validated['child_name'],
            attendedPhotoSession: $validated['attended_photo_session'] !== null
                ? (bool) $validated['attended_photo_session']
                : null,
        );
    }
}
