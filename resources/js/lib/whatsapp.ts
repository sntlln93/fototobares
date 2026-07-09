/**
 * Normalizes a locally-stored Argentine phone number to the
 * international digits-only format WhatsApp links expect (549...).
 * Returns null when the number is too short to be dialable.
 */
export function normalizeArPhone(phone: string): string | null {
    let digits = phone.replace(/\D/g, '');

    if (digits.startsWith('549')) {
        return digits.length >= 11 ? digits : null;
    }

    if (digits.startsWith('54')) {
        digits = digits.slice(2);
    }

    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    if (digits.length < 8) {
        return null;
    }

    return `549${digits}`;
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
