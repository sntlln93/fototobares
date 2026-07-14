<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Argentine phone numbers, as typed by humans. Mirrors the frontend
 * `lib/whatsapp.ts` normalization so a number copied from WhatsApp
 * (+54 9 380 400-0003) and the same number stored locally (3804000003)
 * are comparable.
 */
class Phone
{
    /**
     * The dialable part of a number: digits only, without the country code
     * (54), the mobile 9, or the domestic trunk 0.
     */
    public static function localDigits(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? '';

        if (str_starts_with($digits, '549')) {
            $digits = substr($digits, 3);
        } elseif (str_starts_with($digits, '54')) {
            $digits = substr($digits, 2);
        }

        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        return $digits;
    }

    /**
     * SQL expression stripping a phone column's separators so it's
     * comparable, digit by digit, with a normalized search term.
     *
     * @param  literal-string  $column
     * @return literal-string
     */
    public static function digitsExpression(string $column): string
    {
        return "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE({$column}, ' ', ''), '-', ''), '(', ''), ')', ''), '+', ''), '.', '')";
    }
}
