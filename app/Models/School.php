<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SchoolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class School extends Model
{
    /** @use HasFactory<SchoolFactory> */
    use HasFactory;

    /**
     * @return HasMany<Classroom, $this>
     */
    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    /**
     * @return MorphOne<Contact, $this>
     */
    public function principal()
    {
        return $this->morphOne(Contact::class, 'contactable');
    }

    /**
     * @return MorphOne<Address, $this>
     */
    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    /**
     * @return HasManyThrough<Contact, Classroom, $this>
     */
    public function teachers()
    {
        return $this->hasManyThrough(Contact::class, Classroom::class, 'school_id', 'id')
            ->where('contactable_type', Classroom::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
