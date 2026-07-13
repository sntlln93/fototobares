<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\Payment;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Only transfers carry a transaction number
        if ($this->input('type') !== 'transferencia') {
            $this->merge(['transaction_number' => null]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'type' => ['required', 'string', 'max:255'],
            'transaction_number' => [
                'required_if:type,transferencia',
                'nullable',
                'string',
                'alpha_num:ascii',
                'max:255',
                $this->uniqueTransactionNumber(...),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'transaction_number.required_if' => 'El número de transacción es obligatorio para pagos por transferencia.',
            'transaction_number.alpha_num' => 'El número de transacción sólo puede contener letras y números.',
        ];
    }

    private function uniqueTransactionNumber(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $query = Payment::query()->where('transaction_number', $value);

        $current = $this->route('payment');

        if ($current instanceof Payment) {
            $query->whereKeyNot($current->id);
        }

        $existing = $query->first();

        if ($existing !== null) {
            $fail("El número de transacción ya está registrado en el pedido #{$existing->order_id}.");
        }
    }
}
