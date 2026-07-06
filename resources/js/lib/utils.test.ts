import { describe, expect, it } from 'vitest';
import { capitalize, formatPrice, getColorEs } from './utils';

// Intl formats with non-breaking spaces: normalize before asserting
const normalize = (value: string) => value.replace(/\u00a0/g, ' ');

describe('formatPrice', () => {
    it('formats amounts as ARS currency without decimals', () => {
        expect(normalize(formatPrice(12000))).toBe('$ 12.000');
    });

    it('formats zero', () => {
        expect(normalize(formatPrice(0))).toBe('$ 0');
    });
});

describe('capitalize', () => {
    it('uppercases the first letter and lowercases the rest', () => {
        expect(capitalize('transferencia')).toBe('Transferencia');
        expect(capitalize('EFECTIVO')).toBe('Efectivo');
    });
});

describe('getColorEs', () => {
    it('translates known colors to Spanish', () => {
        expect(getColorEs('black')).toBe('Negro');
        expect(getColorEs('blue')).toBe('Celeste');
        expect(getColorEs('white')).toBe('Blanco');
    });

    it('falls back to the capitalized original for unknown colors', () => {
        expect(getColorEs('magenta')).toBe('Magenta');
    });
});
