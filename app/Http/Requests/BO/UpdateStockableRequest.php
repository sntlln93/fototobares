<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Enums\Unit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStockableRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'min: 4'],
            'quantity' => ['sometimes', 'numeric', 'min:1'],
            'alert_at' => ['sometimes', 'numeric', 'min:1'],
            'unit' => ['sometimes', Rule::in(Unit::cases())],
        ];
    }
}
