import { describe, expect, it } from 'vitest';
import { normalizeArPhone, waShareUrl } from './whatsapp';

describe('normalizeArPhone', () => {
    it('prefixes local numbers with the mobile country code', () => {
        expect(normalizeArPhone('3804123456')).toBe('5493804123456');
    });

    it('strips separators and spaces', () => {
        expect(normalizeArPhone('380 412-3456')).toBe('5493804123456');
    });

    it('drops the leading zero of area codes', () => {
        expect(normalizeArPhone('03804123456')).toBe('5493804123456');
    });

    it('keeps numbers already in international format', () => {
        expect(normalizeArPhone('5493804123456')).toBe('5493804123456');
        expect(normalizeArPhone('+54 9 380 412-3456')).toBe('5493804123456');
    });

    it('adds the mobile 9 to numbers with a bare country code', () => {
        expect(normalizeArPhone('543804123456')).toBe('5493804123456');
    });

    it('returns null for numbers too short to dial', () => {
        expect(normalizeArPhone('1234')).toBe(null);
        expect(normalizeArPhone('')).toBe(null);
        expect(normalizeArPhone('sin teléfono')).toBe(null);
    });
});

describe('waShareUrl', () => {
    it('targets the client phone with the message prefilled', () => {
        const url = waShareUrl('3804123456', 'Hola!');

        expect(url).toBe('https://wa.me/5493804123456?text=Hola!');
    });

    it('encodes the message', () => {
        const url = waShareUrl('3804123456', 'Saldo: $ 7.000\nGracias');

        expect(url).toContain('text=Saldo%3A%20%24%207.000%0AGracias');
    });

    it('opens the chat picker when the phone is missing or invalid', () => {
        expect(waShareUrl(null, 'Hola')).toBe('https://wa.me/?text=Hola');
        expect(waShareUrl('1234', 'Hola')).toBe('https://wa.me/?text=Hola');
    });
});
