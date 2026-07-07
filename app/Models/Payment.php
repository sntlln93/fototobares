<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_id
 * @property int $amount
 * @property string $type
 * @property string|null $proof_of_payment
 */
class Payment extends Model
{
    /** @use \Illuminate\Database\Eloquent\Factories\HasFactory<\Database\Factories\PaymentFactory> */
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Order, $this>
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
