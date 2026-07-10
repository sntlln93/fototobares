<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\OrderDraftFactory;
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

    protected $casts = [
        'products' => 'array',
        'due_date' => 'datetime:Y-m-d',
        'attended_photo_session' => 'boolean',
    ];
}
