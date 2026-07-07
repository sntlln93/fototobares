import { describe, expect, it } from 'vitest';
import {
    buildProductOrders,
    initialDetailFormData,
    resolveVariants,
    validateDetailForm,
} from './detail-form';
import { SelectableProduct } from './form';

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: {
        photo_types: ['individual', 'grupo'],
        orientations: ['vertical', 'horizontal'],
        backgrounds: ['blue'],
        colors: ['brown'],
        dimentions: '30x40',
    },
} as unknown as SelectableProduct;

const taza = {
    id: 2,
    product_type_id: 2,
    name: 'Taza',
    combo_id: 4,
} as SelectableProduct;

const completeMuralData = () => ({
    orientation: [{ product_id: 1, value: 'vertical' as const }],
    photoType: [{ product_id: 1, value: 'individual' as const }],
    background: [{ product_id: 1, value: 'blue' }],
    color: [{ product_id: 1, value: 'brown' }],
    note: [{ product_id: 1, value: 'Martina' }],
});

describe('validateDetailForm', () => {
    it('requires every variant and the note for murals', () => {
        const errors = validateDetailForm([mural], initialDetailFormData());

        expect(Object.keys(errors[1])).toEqual([
            'orientation',
            'photoType',
            'background',
            'color',
            'note',
        ]);
    });

    it('passes a mural with every field set', () => {
        const errors = validateDetailForm([mural], completeMuralData());

        expect(errors).toEqual({});
    });

    it('reports only the missing fields', () => {
        const data = completeMuralData();
        data.color = [];
        data.note = [];

        const errors = validateDetailForm([mural], data);

        expect(Object.keys(errors[1])).toEqual(['color', 'note']);
    });

    it('requires nothing for non-mural products', () => {
        const errors = validateDetailForm([taza], initialDetailFormData());

        expect(errors).toEqual({});
    });

    it('requires only the note for a mural without configured variants', () => {
        const bareMural = {
            ...mural,
            variants: undefined,
        } as SelectableProduct;

        const errors = validateDetailForm([bareMural], initialDetailFormData());

        expect(Object.keys(errors[1])).toEqual(['note']);

        const withNote = initialDetailFormData([
            { product_id: 1, note: 'Martina' },
        ]);

        expect(validateDetailForm([bareMural], withNote)).toEqual({});
    });

    it('validates each product independently', () => {
        const secondMural = { ...mural, id: 9 } as SelectableProduct;

        const errors = validateDetailForm(
            [mural, secondMural, taza],
            completeMuralData(),
        );

        expect(errors[1]).toBeUndefined();
        expect(errors[9]).toBeDefined();
        expect(errors[2]).toBeUndefined();
    });
});

describe('buildProductOrders', () => {
    it('builds a mural detail with its variant', () => {
        const orders = buildProductOrders([mural], completeMuralData());

        expect(orders).toEqual([
            {
                combo_id: undefined,
                product_id: 1,
                variant: {
                    orientation: 'vertical',
                    photo_type: 'individual',
                    background: 'blue',
                    color: 'brown',
                },
                note: 'Martina',
            },
        ]);
    });

    it('builds a mural without configured variants without a variant payload', () => {
        const bareMural = {
            ...mural,
            variants: undefined,
        } as SelectableProduct;

        const orders = buildProductOrders(
            [bareMural],
            initialDetailFormData([{ product_id: 1, note: 'Martina' }]),
        );

        expect(orders[0].variant).toBeUndefined();
        expect(orders[0].note).toBe('Martina');
    });

    it('builds non-mural details without a variant and keeps the combo id', () => {
        const orders = buildProductOrders([taza], initialDetailFormData());

        expect(orders).toEqual([
            {
                combo_id: 4,
                product_id: 2,
                variant: undefined,
                note: '',
            },
        ]);
    });
});

describe('initialDetailFormData', () => {
    it('starts empty without initial values', () => {
        expect(initialDetailFormData()).toEqual({
            orientation: [],
            photoType: [],
            background: [],
            color: [],
            note: [],
        });
    });

    it('prefills variant and note when editing', () => {
        const data = initialDetailFormData([
            {
                product_id: 1,
                note: 'Martina',
                variant: {
                    orientation: 'vertical',
                    photo_type: 'individual',
                    background: 'blue',
                    color: 'brown',
                },
            },
        ]);

        expect(data.orientation).toEqual([
            { product_id: 1, value: 'vertical' },
        ]);
        expect(data.note).toEqual([{ product_id: 1, value: 'Martina' }]);
    });

    it('prefills only the note for products without a variant', () => {
        const data = initialDetailFormData([
            { product_id: 2, note: 'Taza de Pedro' },
        ]);

        expect(data.orientation).toEqual([]);
        expect(data.note).toEqual([{ product_id: 2, value: 'Taza de Pedro' }]);
    });
});

describe('resolveVariants', () => {
    const variants = {
        photo_types: ['individual'],
        orientations: ['vertical'],
        backgrounds: ['blue'],
        colors: ['brown'],
        dimentions: '30x40',
    } as SelectableProduct['variants'];

    it('prefers the combo pivot variants', () => {
        const product = {
            ...mural,
            variants,
            pivot: { variants: { ...variants, backgrounds: ['white'] } },
        } as SelectableProduct;

        expect(resolveVariants(product)?.backgrounds).toEqual(['white']);
    });

    it('parses pivot variants stored as JSON', () => {
        const product = {
            ...mural,
            pivot: { variants: JSON.stringify(variants) },
        } as unknown as SelectableProduct;

        expect(resolveVariants(product)?.orientations).toEqual(['vertical']);
    });

    it('falls back to the product variants', () => {
        const product = { ...mural, variants } as SelectableProduct;

        expect(resolveVariants(product)).toEqual(variants);
    });
});
