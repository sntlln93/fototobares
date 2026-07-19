import { phoneSearchDigits } from '@/lib/whatsapp';

export interface HighlightSegment {
    text: string;
    match: boolean;
}

/** Lowercase and strip accents, so "lopez" matches "López" as the DB does. */
function fold(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
}

function segments(
    text: string,
    ranges: [number, number][],
): HighlightSegment[] {
    const result: HighlightSegment[] = [];
    let cursor = 0;

    for (const [start, end] of ranges) {
        if (start > cursor) {
            result.push({ text: text.slice(cursor, start), match: false });
        }

        result.push({ text: text.slice(start, end), match: true });
        cursor = end;
    }

    if (cursor < text.length) {
        result.push({ text: text.slice(cursor), match: false });
    }

    return result;
}

/**
 * Splits `text` into segments, marking the ones that match the search term.
 * Matching mirrors the backend search: case and accent insensitive.
 */
export function highlightSegments(
    text: string,
    term: string | null | undefined,
): HighlightSegment[] {
    const needle = fold(term?.trim() ?? '');

    if (!needle) {
        return [{ text, match: false }];
    }

    const haystack = fold(text);
    const ranges: [number, number][] = [];

    let from = 0;
    let found = haystack.indexOf(needle, from);

    while (found !== -1) {
        ranges.push([found, found + needle.length]);
        from = found + needle.length;
        found = haystack.indexOf(needle, from);
    }

    return segments(text, ranges);
}

/**
 * Same, for a phone: the term is matched digit by digit (the backend ignores
 * separators and the +549 prefix), so the highlight has to map the matched
 * digits back onto the original string — searching "+54 9 380 400-0003"
 * highlights "380 400-0003" inside a phone stored with its separators.
 */
export function highlightPhoneSegments(
    phone: string,
    term: string | null | undefined,
): HighlightSegment[] {
    const needle = phoneSearchDigits(term?.trim() ?? '');

    if (!needle) {
        return [{ text: phone, match: false }];
    }

    // Position of every digit of `phone` within `phone` itself.
    const positions: number[] = [];
    let digits = '';

    for (let index = 0; index < phone.length; index++) {
        if (/\d/.test(phone[index])) {
            digits += phone[index];
            positions.push(index);
        }
    }

    const at = digits.indexOf(needle);

    if (at === -1) {
        return [{ text: phone, match: false }];
    }

    const start = positions[at];
    const end = positions[at + needle.length - 1] + 1;

    return segments(phone, [[start, end]]);
}
