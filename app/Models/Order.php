<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read int|string|null $payments_sum_amount
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsToMany<Product, $this, OrderDetail>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_details')
            ->using(OrderDetail::class)
            ->withPivot('id', 'note', 'variant', 'delivered_at', 'production_status_id', 'status_updated_at', 'priority', 'recycled_to')
            ->withTimestamps();
    }

    /**
     * @return HasMany<OrderDetail, $this>
     */
    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * @return BelongsTo<Classroom, $this>
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments()
    {
        return $this->hasMany(Payment::class)->orderBy('paid_on')->orderBy('id');
    }

    /**
     * @return HasMany<Note, $this>
     */
    public function notes()
    {
        return $this->hasMany(Note::class)->latest();
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
     * Installments whose due day already passed on the given date. The first
     * one falls on `due_date` and each following one a month later, on the
     * same day: 25/7, 25/8, 25/9…
     *
     * A due day that a shorter month lacks rolls over (31/1 → 3/3), so an
     * order is never counted late before the day the seller picked.
     */
    public function overdueInstallments(CarbonInterface $on): int
    {
        $plan = (int) $this->payment_plan;
        $day = $on->copy()->startOfDay();

        $overdue = 0;

        for ($month = 0; $month < $plan; $month++) {
            if ($this->due_date->copy()->addMonths($month)->startOfDay()->greaterThanOrEqualTo($day)) {
                break;
            }

            $overdue++;
        }

        return $overdue;
    }

    /**
     * Amount the client should have paid by the given date: one installment
     * per due day already passed.
     */
    public function amountOverdue(CarbonInterface $on): int
    {
        $plan = (int) $this->payment_plan;

        if ($plan <= 0) {
            return 0;
        }

        return (int) round((int) $this->total_price * $this->overdueInstallments($on) / $plan);
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

    protected $casts = [
        'due_date' => 'datetime:Y-m-d',
        'attended_photo_session' => 'boolean',
        'cancelled_at' => 'datetime',
    ];
}
