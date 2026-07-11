<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

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
}
