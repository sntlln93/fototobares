<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Data\Orders\CancelOrderData;
use App\Data\Orders\DestinationData;
use App\Models\Order;
use App\Models\User;
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

    public function toData(Order $order, ?User $user): CancelOrderData
    {
        /** @var array{destinations: list<array{detail_id: int|string, destination: string}>} $validated */
        $validated = $this->validated();

        return new CancelOrderData(
            order: $order,
            destinations: array_map(
                fn (array $destination) => new DestinationData(
                    detailId: (int) $destination['detail_id'],
                    destination: $destination['destination'],
                ),
                $validated['destinations'],
            ),
            user: $user,
        );
    }
}
