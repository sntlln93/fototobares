import { describe, expect, it } from 'vitest';
import {
    buildProductOrders,
    DetailFormData,
    initialDetailFormData,
    validateDetailForm,
} from './detail-form';
import { SelectableProduct } from './form';

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: [
        {
            label: 'Tipo de foto',
            type: 'text',
            nullable: false,
            options: [{ label: 'Individual' }, { label: 'Grupo' }],
        },
        {
            label: 'Orientación',
            type: 'text',
            nullable: false,
            options: [{ label: 'Vertical' }, { label: 'Horizontal' }],
        },
        {
            label: 'Fondo',
            type: 'color',
            nullable: false,
            options: [{ label: 'Celeste', color: '#93c5fd' }],
        },
        {
            label: 'Color',
            type: 'color',
            nullable: false,
            options: [{ label: 'Marrón', color: '#78350f' }],
        },
    ],
} as unknown as SelectableProduct;

const taza = {
    id: 2,
    product_type_id: 2,
    name: 'Taza',
    combo_id: 4,
} as SelectableProduct;

const banda = {
    id: 3,
    product_type_id: 3,
    name: 'Banda',
    variants: [
        {
            label: 'Talle',
            type: 'text',
            nullable: true,
            options: [{ label: 'Único' }, { label: 'S' }],
        },
    ],
} as unknown as SelectableProduct;

const completeMuralData = (): DetailFormData => ({
    1: {
        values: {
            'Tipo de foto': 'Individual',
            Orientación: 'Vertical',
            Fondo: 'Celeste',
            Color: 'Marrón',
        },
        note: 'Martina',
    },
});

describe('validateDetailForm', () => {
    it('requires every variant and the note for murals', () => {
        const errors = validateDetailForm([mural], initialDetailFormData());

        expect(Object.keys(errors[1])).toEqual([
            'Tipo de foto',
            'Orientación',
            'Fondo',
            'Color',
            'note',
        ]);
    });

    it('passes a mural with every field set', () => {
        const errors = validateDetailForm([mural], completeMuralData());

        expect(errors).toEqual({});
    });

    it('reports only the missing fields', () => {
        const data = completeMuralData();
        delete data[1].values.Color;
        data[1].note = '';

        const errors = validateDetailForm([mural], data);

        expect(Object.keys(errors[1])).toEqual(['Color', 'note']);
    });

    it('requires nothing for non-mural products without variants', () => {
        const errors = validateDetailForm([taza], initialDetailFormData());

        expect(errors).toEqual({});
    });

    it('never errors on a nullable variant left pending', () => {
        const errors = validateDetailForm([banda], initialDetailFormData());

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
    it('builds a mural detail with its variant selection', () => {
        const orders = buildProductOrders([mural], completeMuralData());

        expect(orders).toEqual([
            {
                combo_id: undefined,
                product_id: 1,
                variant: {
                    'Tipo de foto': 'Individual',
                    Orientación: 'Vertical',
                    Fondo: 'Celeste',
                    Color: 'Marrón',
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

    it('sends an explicit null for a nullable variant left unset', () => {
        const orders = buildProductOrders([banda], initialDetailFormData());

        expect(orders[0].variant).toEqual({ Talle: null });
    });
});

describe('initialDetailFormData', () => {
    it('starts empty without initial values', () => {
        expect(initialDetailFormData()).toEqual({});
    });

    it('prefills variant selection and note when editing', () => {
        const data = initialDetailFormData([
            {
                product_id: 1,
                note: 'Martina',
                variant: {
                    'Tipo de foto': 'Individual',
                    Orientación: 'Vertical',
                    Fondo: 'Celeste',
                    Color: 'Marrón',
                },
            },
        ]);

        expect(data[1].values.Orientación).toBe('Vertical');
        expect(data[1].note).toBe('Martina');
    });

    it('prefills only the note for products without a variant', () => {
        const data = initialDetailFormData([
            { product_id: 2, note: 'Taza de Pedro' },
        ]);

        expect(data[2].values).toEqual({});
        expect(data[2].note).toBe('Taza de Pedro');
    });
});
