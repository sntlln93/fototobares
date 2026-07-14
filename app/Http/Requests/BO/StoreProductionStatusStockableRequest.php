<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Enums\StockDirection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductionStatusStockableRequest extends FormRequest
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
            'stockable_id' => ['required', 'integer', 'exists:stockables,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'direction' => ['required', Rule::enum(StockDirection::class)],
        ];
    }

    /**
     * Signed pivot delta: positive to add stock, negative to consume it.
     */
    public function delta(): int
    {
        $quantity = $this->integer('quantity');
        $direction = StockDirection::from($this->string('direction')->toString());

        return $direction === StockDirection::Add ? $quantity : -$quantity;
    }
}
