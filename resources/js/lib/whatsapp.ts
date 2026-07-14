/**
 * The dialable part of a phone number: digits only, without the country code
 * (54), the mobile 9, or the domestic trunk 0. Mirrors the backend
 * `App\Support\Phone::localDigits()`, which the order search normalizes with.
 */
export function localPhoneDigits(phone: string): string {
    let digits = phone.replace(/\D/g, '');

    if (digits.startsWith('549')) {
        digits = digits.slice(3);
    } else if (digits.startsWith('54')) {
        digits = digits.slice(2);
    }

    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    return digits;
}

/**
 * Normalizes a locally-stored Argentine phone number to the
 * international digits-only format WhatsApp links expect (549...).
 * Returns null when the number is too short to be dialable.
 */
export function normalizeArPhone(phone: string): string | null {
    const digits = localPhoneDigits(phone);

    if (digits.length < 8) {
        return null;
    }

    return `549${digits}`;
}

/**
 * wa.me link to the chat with that number, or null when the number is
 * missing or too short to be dialable.
 */
export function waChatUrl(phone: string | null | undefined): string | null {
    const normalized = phone ? normalizeArPhone(phone) : null;

    return normalized ? `https://wa.me/${normalized}` : null;
}

/**
 * wa.me link with the message prefilled. Without a valid phone it
 * opens WhatsApp's chat picker instead. Note: wa.me cannot attach
 * files — the image must go via the Web Share API or by hand.
 */
export function waShareUrl(
    phone: string | null | undefined,
    text: string,
): string {
    const normalized = phone ? normalizeArPhone(phone) : null;
    const encoded = encodeURIComponent(text);

    return normalized
        ? `https://wa.me/${normalized}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
}
