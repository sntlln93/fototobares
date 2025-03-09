<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Classroom, $this>
     */
    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne<Contact, $this>
     */
    public function principal()
    {
        return $this->morphOne(Contact::class, 'contactable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne<Address, $this>
     */
    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough<Contact, Classroom, $this>
     */
    public function teachers()
    {
        return $this->hasManyThrough(Contact::class, Classroom::class, 'school_id', 'id')
            ->where('contactable_type', Classroom::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
