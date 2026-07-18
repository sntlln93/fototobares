<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Phone;
use Database\Factories\OrderDraftFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDraft extends Model
{
    /** @use HasFactory<OrderDraftFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Classroom, $this>
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Mirrors Order::scopeSearch over the draft's own denormalized columns
     * (no client relation to join here).
     *
     * @param  Builder<OrderDraft>  $query
     * @return Builder<OrderDraft>
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
            $query->where('order_drafts.id', 'like', $like)
                ->orWhere('order_drafts.photo_number', 'like', $like)
                ->orWhere('order_drafts.child_name', 'like', $like)
                ->orWhere('order_drafts.client_name', 'like', $like);

            if ($phone !== null) {
                $query->orWhereRaw(Phone::digitsExpression('order_drafts.client_phone').' like ?', [$phone]);
            }
        });
    }

    protected $casts = [
        'products' => 'array',
        'due_date' => 'datetime:Y-m-d',
        'attended_photo_session' => 'boolean',
    ];
}
