<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Contact extends Model
{
    /**
     * @return MorphTo<Model, $this>
     */
    public function contactable()
    {
        return $this->morphTo();
    }
}
