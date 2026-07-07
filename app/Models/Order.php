<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read int|string|null $payments_sum_amount
 */
class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $casts = [
        'due_date' => 'datetime:Y-m-d',
        'attended_photo_session' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Client, $this>
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Product, $this>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_details')
            ->using(OrderDetail::class)
            ->withPivot('id', 'note', 'variant', 'delivered_at', 'production_status_id', 'status_updated_at', 'priority', 'recycled_to')
            ->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<OrderDetail, $this>
     */
    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Classroom, $this>
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Payment, $this>
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function paidTotal(): int
    {
        return (int) $this->payments()->sum('amount');
    }

    public function balance(): int
    {
        return (int) $this->total_price - $this->paidTotal();
    }

    /**
     * The classroom photo matching this order's photo_number, if any.
     */
    public function photo(): ?Photo
    {
        if ($this->photo_number === null) {
            return null;
        }

        return Photo::query()
            ->where('classroom_id', $this->classroom_id)
            ->where('number', $this->photo_number)
            ->first();
    }
}
