<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CancelOrderRequest extends FormRequest
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
            'destinations' => ['required', 'array', 'min:1'],
            'destinations.*.detail_id' => ['required', 'integer'],
            'destinations.*.destination' => ['required', 'in:stock,reciclaje'],
        ];
    }
}
