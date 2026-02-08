<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDraft extends Model
{
    protected $casts = [
        'products' => 'array',
        'due_date' => 'datetime:Y-m-d',
        'attended_photo_session' => 'boolean',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Classroom, $this>
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}
