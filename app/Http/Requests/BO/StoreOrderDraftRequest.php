<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Orders\OrderDraftCreationData;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderDraftRequest extends FormRequest
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
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'child_name' => ['nullable', 'string'],
            'client_name' => ['nullable', 'string'],
            'client_phone' => ['nullable', 'string'],
            'attended_photo_session' => ['nullable', 'boolean'],
            'total_price' => ['nullable', 'numeric'],
            'payment_plan' => ['nullable', 'numeric'],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'products' => ['nullable', 'array'],
        ];
    }

    public function toData(): OrderDraftCreationData
    {
        /** @var array{
         *     classroom_id: int|string,
         *     child_name?: string|null,
         *     client_name?: string|null,
         *     client_phone?: string|null,
         *     attended_photo_session?: bool|null,
         *     total_price?: int|float|string|null,
         *     payment_plan?: int|float|string|null,
         *     due_date?: string|null,
         *     products?: array<int, array<string, mixed>>|null,
         * } $validated
         */
        $validated = $this->validated();

        return new OrderDraftCreationData(
            classroomId: (int) $validated['classroom_id'],
            childName: $validated['child_name'] ?? null,
            clientName: $validated['client_name'] ?? null,
            clientPhone: $validated['client_phone'] ?? null,
            attendedPhotoSession: isset($validated['attended_photo_session']) ? (bool) $validated['attended_photo_session'] : null,
            totalPrice: isset($validated['total_price']) ? (float) $validated['total_price'] : null,
            paymentPlan: isset($validated['payment_plan']) ? (int) $validated['payment_plan'] : null,
            dueDate: $validated['due_date'] ?? null,
            products: $validated['products'] ?? null,
        );
    }
}
