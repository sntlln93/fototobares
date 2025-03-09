<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo<Model, $this>
     */
    public function contactable()
    {
        return $this->morphTo();
    }
}
