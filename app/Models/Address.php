<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property-read string $full_address
 */
class Address extends Model
{
    /**
     * @return MorphTo<Model, $this>
     */
    public function addressable()
    {
        return $this->morphTo();
    }

    /**
     * @return Attribute<string, never>
     */
    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            get: function () {
                $full_address = '';

                if ($this->street) {
                    $full_address .= $this->street;
                }

                if ($this->number) {
                    $full_address .= strlen($full_address) < 1
                    ? "S/N N° $this->number"
                    : " N° $this->number";
                }

                if ($this->neighborhood) {
                    $full_address .= strlen($full_address) < 1
                    ? "B° $this->neighborhood"
                    : ", B° $this->neighborhood";
                }

                if ($this->city) {
                    $full_address .= strlen($full_address) < 1
                    ? $this->city
                    : ", $this->city";
                }

                return $full_address;
            }
        );
    }
}
