<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StickerPrintRequest extends FormRequest
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
            'ids' => ['sometimes', 'array'],
            'ids.*' => ['integer'],
        ];
    }

    /**
     * @return array<int, int>
     */
    public function orderIds(): array
    {
        /** @var array<int, int|string> $ids */
        $ids = $this->validated('ids', []);

        return array_map(fn ($id) => (int) $id, $ids);
    }
}
