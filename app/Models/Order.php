<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Phone;
use Carbon\CarbonInterface;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Builder;
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
            ->withPivot('id', 'note', 'variant', 'delivered_at', 'production_status_id', 'production_enabled_at', 'status_updated_at', 'priority', 'recycled_to')
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

    /**
     * Free-text search over the columns the order tables show: order number,
     * child, client and — the WhatsApp use case — the client's phone, matched
     * digit by digit so separators and the +549 prefix don't get in the way.
     *
     * The phone is only searched when `Phone::searchPattern` returns a
     * pattern (see its docblock for the minimum-digits and normalization
     * rules), so a short numeric search (an order number) doesn't
     * necessarily match every phone containing those digits.
     *
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';
        $phone = Phone::searchPattern($term);

        return $query->where(function (Builder $query) use ($like, $phone) {
            $query->where('orders.id', 'like', $like)
                ->orWhere('orders.photo_number', 'like', $like)
                ->orWhere('orders.child_name', 'like', $like)
                ->orWhereHas('client', function (Builder $client) use ($like, $phone) {
                    $client->where('clients.name', 'like', $like);

                    if ($phone !== null) {
                        $client->orWhereRaw(Phone::digitsExpression('clients.phone').' like ?', [$phone]);
                    }
                });
        });
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function scopeForSchool(Builder $query, ?int $schoolId): Builder
    {
        if ($schoolId === null) {
            return $query;
        }

        return $query->whereHas('classroom', function (Builder $classroom) use ($schoolId) {
            $classroom->where('classrooms.school_id', $schoolId);
        });
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function scopeForClassroom(Builder $query, ?int $classroomId): Builder
    {
        if ($classroomId === null) {
            return $query;
        }

        return $query->where('orders.classroom_id', $classroomId);
    }

    public function paidTotal(): int
    {
        return (int) $this->payments()->sum('amount');
    }

    /**
     * Whether the client already covered the first installment
     * (total / plan). It gates production: nothing is manufactured —
     * or enters /tracking — before this is true.
     */
    public function firstInstallmentPaid(): bool
    {
        if ((int) $this->payment_plan <= 0) {
            return false;
        }

        $paid = $this->relationLoaded('payments')
            ? $this->payments->sum(fn (Payment $payment): int => (int) $payment->amount)
            : $this->paidTotal();

        return $paid >= (int) $this->total_price / (int) $this->payment_plan;
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
