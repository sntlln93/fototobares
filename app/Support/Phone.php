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
    /** Below this many digits a numeric search term is too short to match a phone. */
    private const MIN_SEARCH_DIGITS = 3;

    /**
     * The SQL `LIKE` pattern to match a phone-search term, or `null` when the
     * term has too few digits to search the phone column.
     *
     * Prefix/trunk stripping (country code 54, mobile 9, domestic trunk 0)
     * only applies when what remains is still a full 10-digit local number —
     * that's the "looks like a complete number" case. Anything shorter is a
     * fragment and is matched literally, digit by digit, leading zeros kept.
     */
    public static function searchPattern(string $term): ?string
    {
        $digits = preg_replace('/\D/', '', $term) ?? '';

        if (str_starts_with($digits, '549') && strlen($digits) >= 13) {
            $digits = substr($digits, 3);
        } elseif (str_starts_with($digits, '54') && strlen($digits) >= 12) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0') && strlen($digits) >= 11) {
            $digits = substr($digits, 1);
        }

        if (strlen($digits) < self::MIN_SEARCH_DIGITS) {
            return null;
        }

        return '%'.$digits.'%';
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
