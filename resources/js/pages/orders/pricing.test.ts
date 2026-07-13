import { describe, expect, it } from 'vitest';
import { ComboProduct, ComboWithProducts, ProductOrder } from './form';
import { computeTotal, priceBreakdown } from './pricing';

const product = (id: number, name: string, unitPrice: number): Product =>
    ({ id, name, unit_price: unitPrice }) as Product;

const comboProduct = (
    id: number,
    name: string,
    subtractValue: number,
): ComboProduct =>
    ({
        ...product(id, name, 0),
        pivot: { quantity: 1, subtract_value: subtractValue },
    }) as ComboProduct;

const mural = product(1, 'Moldura ancha', 48000);
const carpeta = product(2, 'Carpeta 2 fotos', 18000);
const medalla = product(3, 'Medalla', 6000);
const taza = product(4, 'Taza', 12000);

const products = [mural, carpeta, medalla, taza];

const combo: ComboWithProducts = {
    id: 1,
    name: 'Combo 1 (M.A)',
    suggested_price: 60000,
    default_payments: 4,
    products: [
        comboProduct(1, 'Moldura ancha', 30000),
        comboProduct(2, 'Carpeta 2 fotos', 8000),
        comboProduct(3, 'Medalla', 2000),
    ],
};

const otherCombo: ComboWithProducts = {
    id: 2,
    name: 'Combo 2 (CLA)',
    suggested_price: 56000,
    default_payments: 4,
    products: [comboProduct(1, 'Moldura ancha', 28000)],
};

const combos = [combo, otherCombo];

const fullCombo = (comboId: number, productIds: number[]): ProductOrder[] =>
    productIds.map((id) => ({ product_id: id, combo_id: comboId, note: '' }));

const extra = (productId: number): ProductOrder => ({
    product_id: productId,
    note: '',
});

describe('computeTotal', () => {
    it('is zero for an empty cart', () => {
        expect(computeTotal([], combos, products)).toBe(0);
    });

    it('charges the combo price, not the sum of its products', () => {
        const details = fullCombo(1, [1, 2, 3]);

        expect(computeTotal(details, combos, products)).toBe(60000);
    });

    it('adds the extras at list price on top of the combo', () => {
        const details = [...fullCombo(1, [1, 2, 3]), extra(4)];

        expect(computeTotal(details, combos, products)).toBe(72000);
    });

    it('subtracts the configured value when a combo product is taken out', () => {
        const details = fullCombo(1, [1, 2]);

        // 60000 − 2000 (medalla), not − 6000 (its list price)
        expect(computeTotal(details, combos, products)).toBe(58000);
    });

    it('drops the combo entirely once all of its products are taken out', () => {
        expect(computeTotal(fullCombo(1, []), combos, products)).toBe(0);
    });

    it('does not accumulate when the combo is switched: only the cart counts', () => {
        const first = fullCombo(1, [1, 2, 3]);
        const switched = fullCombo(2, [1]);

        expect(computeTotal(first, combos, products)).toBe(60000);
        // Regression (#100): the old total was added to the new combo price
        expect(computeTotal(switched, combos, products)).toBe(56000);
    });

    it('sums both combos when both are in the cart', () => {
        const details = [...fullCombo(1, [1, 2, 3]), ...fullCombo(2, [1])];

        expect(computeTotal(details, combos, products)).toBe(116000);
    });

    it('prices the products of an unknown combo as standalone extras', () => {
        const details: ProductOrder[] = [
            { product_id: 4, combo_id: 99, note: '' },
        ];

        expect(computeTotal(details, combos, products)).toBe(12000);
    });

    it('ignores details whose product no longer exists', () => {
        expect(computeTotal([extra(99)], combos, products)).toBe(0);
    });

    it('never goes below zero when the subtractions exceed the combo price', () => {
        const cheapCombo: ComboWithProducts = {
            ...combo,
            suggested_price: 1000,
        };

        const details = fullCombo(1, [1]);

        expect(computeTotal(details, [cheapCombo], products)).toBe(0);
    });
});

describe('priceBreakdown', () => {
    it('explains the price line by line', () => {
        const details = [...fullCombo(1, [1, 2]), extra(4)];

        expect(priceBreakdown(details, combos, products)).toEqual({
            lines: [
                { label: 'Combo 1 (M.A)', amount: 60000 },
                { label: 'Sin Medalla', amount: -2000 },
                { label: 'Taza', amount: 12000 },
            ],
            total: 70000,
        });
    });

    it('omits a product taken out with no subtract value configured', () => {
        const free: ComboWithProducts = {
            ...combo,
            products: [
                comboProduct(1, 'Moldura ancha', 30000),
                comboProduct(3, 'Medalla', 0),
            ],
        };

        const { lines } = priceBreakdown(fullCombo(1, [1]), [free], products);

        expect(lines).toEqual([{ label: 'Combo 1 (M.A)', amount: 60000 }]);
    });
});
