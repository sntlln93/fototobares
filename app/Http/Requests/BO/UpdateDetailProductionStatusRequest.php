<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

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
}
