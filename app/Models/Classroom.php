<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_draft' => 'boolean',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne<Contact, $this>
     */
    public function teacher()
    {
        return $this->morphOne(Contact::class, 'contactable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<School, $this>
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Photo, $this>
     */
    public function photos()
    {
        return $this->hasMany(Photo::class);
    }
}
