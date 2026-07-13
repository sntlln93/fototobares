import { describe, expect, it } from 'vitest';
import { SelectedProduct, upsertSelectedProduct } from './form';

const variants = (
    orientations: ProductOrientation[],
): SelectedProduct['variants'] => ({
    orientations,
    photo_types: ['individual'],
    backgrounds: ['blue'],
    colors: ['brown'],
    dimentions: '20x30',
});

describe('upsertSelectedProduct', () => {
    it('appends a product that is not selected yet', () => {
        const result = upsertSelectedProduct(
            [{ id: 1, quantity: 2, subtract_value: 0 }],
            {
                id: 5,
                quantity: 1,
                subtract_value: 0,
                variants: variants(['vertical']),
            },
        );

        expect(result).toHaveLength(2);
        expect(result[1].id).toBe(5);
    });

    it('replaces the variants keeping the chosen quantity when editing', () => {
        const result = upsertSelectedProduct(
            [
                {
                    id: 5,
                    quantity: 3,
                    subtract_value: 0,
                    variants: variants(['vertical']),
                },
            ],
            {
                id: 5,
                quantity: 1,
                subtract_value: 0,
                variants: variants(['horizontal']),
            },
        );

        expect(result).toHaveLength(1);
        expect(result[0].quantity).toBe(3);
        expect(result[0].variants?.orientations).toEqual(['horizontal']);
    });

    it('keeps the subtract value when editing: the modal only edits variants', () => {
        const result = upsertSelectedProduct(
            [
                {
                    id: 5,
                    quantity: 1,
                    subtract_value: 2000,
                    variants: variants(['vertical']),
                },
            ],
            {
                id: 5,
                quantity: 1,
                subtract_value: 0,
                variants: variants(['horizontal']),
            },
        );

        expect(result[0].subtract_value).toBe(2000);
    });

    it('leaves the other selected products untouched', () => {
        const result = upsertSelectedProduct(
            [
                { id: 1, quantity: 2, subtract_value: 500 },
                {
                    id: 5,
                    quantity: 1,
                    subtract_value: 0,
                    variants: variants(['vertical']),
                },
            ],
            {
                id: 5,
                quantity: 1,
                subtract_value: 0,
                variants: variants(['horizontal']),
            },
        );

        expect(result[0]).toEqual({ id: 1, quantity: 2, subtract_value: 500 });
    });
});
