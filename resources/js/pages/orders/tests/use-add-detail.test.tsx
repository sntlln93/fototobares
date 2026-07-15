import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductOrder, SelectableProduct } from '../form';
import { useAddDetail } from '../hooks/use-add-detail';

const muralVariants: VariantDefinition[] = [
    {
        label: 'Orientación',
        type: 'text',
        nullable: false,
        options: [{ label: 'Vertical' }, { label: 'Horizontal' }],
    },
    {
        label: 'Tipo de foto',
        type: 'text',
        nullable: false,
        options: [{ label: 'Individual' }, { label: 'Grupo' }],
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
        options: [
            { label: 'Marrón', color: '#78350f' },
            { label: 'Negro', color: '#1c1917' },
        ],
    },
];

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: muralVariants,
} as unknown as SelectableProduct;

const taza = { id: 2, product_type_id: 2, name: 'Taza' } as SelectableProduct;

type HookResult = { current: ReturnType<typeof useAddDetail> };

const setup = (
    products: SelectableProduct[],
    initialValues?: ProductOrder[],
) => {
    const addProducts = vi.fn();
    const onClose = vi.fn();

    const { result } = renderHook(() =>
        useAddDetail({ products, addProducts, onClose, initialValues }),
    );

    return { result, addProducts, onClose };
};

const fillMural = (result: HookResult, productId: number) => {
    act(() => {
        result.current.setVariantValue(productId, 'Orientación', 'Vertical');
        result.current.setVariantValue(productId, 'Tipo de foto', 'Individual');
        result.current.setVariantValue(productId, 'Fondo', 'Celeste');
        result.current.setVariantValue(productId, 'Color', 'Marrón');
        result.current.setNote(productId, 'Emma');
    });
};

describe('useAddDetail', () => {
    it('stores per-product note values and replaces them on update', () => {
        const { result } = setup([mural, taza]);

        expect(result.current.getNote(1)).toBe('');

        act(() => {
            result.current.setNote(1, 'Emma');
            result.current.setNote(2, 'Luca');
        });

        expect(result.current.getNote(1)).toBe('Emma');
        expect(result.current.getNote(2)).toBe('Luca');

        act(() => result.current.setNote(1, 'Emma B.'));

        expect(result.current.getNote(1)).toBe('Emma B.');
        expect(result.current.getNote(2)).toBe('Luca');
    });

    it('blocks adding while a mural is incomplete', () => {
        const { result, addProducts, onClose } = setup([mural]);

        act(() => result.current.handleAddProduct());

        expect(addProducts).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(Object.keys(result.current.errors[1])).toEqual([
            'Orientación',
            'Tipo de foto',
            'Fondo',
            'Color',
            'note',
        ]);
    });

    it('clears each field error as a valid value arrives, per product', () => {
        const secondMural = { ...mural, id: 9 } as SelectableProduct;
        const { result } = setup([mural, secondMural]);

        act(() => result.current.handleAddProduct());

        expect(Object.keys(result.current.errors)).toEqual(['1', '9']);

        act(() => result.current.setVariantValue(1, 'Orientación', 'Vertical'));

        expect(result.current.errors[1].Orientación).toBeUndefined();
        expect(result.current.errors[1].note).toBeDefined();

        fillMural(result, 1);

        // The completed mural drops out; the other product keeps its errors
        expect(result.current.errors[1]).toBeUndefined();
        expect(result.current.errors[9]).toBeDefined();
    });

    it('keeps the error when the new value is empty', () => {
        const { result } = setup([mural]);

        act(() => result.current.handleAddProduct());
        act(() => result.current.setNote(1, ''));

        expect(result.current.getNote(1)).toBe('');
        expect(result.current.errors[1].note).toBeDefined();
    });

    it('adds a completed mural with its variant selection and closes', () => {
        const { result, addProducts, onClose } = setup([mural]);

        fillMural(result, 1);
        act(() => result.current.handleAddProduct());

        expect(result.current.errors).toEqual({});
        expect(addProducts).toHaveBeenCalledWith([
            {
                combo_id: undefined,
                product_id: 1,
                variant: {
                    Orientación: 'Vertical',
                    'Tipo de foto': 'Individual',
                    Fondo: 'Celeste',
                    Color: 'Marrón',
                },
                note: 'Emma',
            },
        ]);
        expect(onClose).toHaveBeenCalled();
    });

    it('prefills from initial values and passes validation on submit', () => {
        const initialValues: ProductOrder[] = [
            {
                product_id: 1,
                note: 'Mural de Emma',
                variant: {
                    Orientación: 'Horizontal',
                    'Tipo de foto': 'Grupo',
                    Fondo: 'Celeste',
                    Color: 'Negro',
                },
            },
        ];
        const { result, addProducts, onClose } = setup([mural], initialValues);

        expect(result.current.getVariantValue(1, 'Orientación')).toBe(
            'Horizontal',
        );
        expect(result.current.getNote(1)).toBe('Mural de Emma');

        act(() => result.current.handleAddProduct());

        expect(addProducts).toHaveBeenCalledWith([
            {
                combo_id: undefined,
                product_id: 1,
                variant: initialValues[0].variant,
                note: 'Mural de Emma',
            },
        ]);
        expect(onClose).toHaveBeenCalled();
    });

    it('steps through the products staying within bounds', () => {
        const { result } = setup([mural, taza]);

        expect(result.current.currentStep).toBe(0);

        act(() => result.current.handleNextStep());
        expect(result.current.currentStep).toBe(1);

        act(() => result.current.handleNextStep());
        expect(result.current.currentStep).toBe(1);

        act(() => result.current.handlePreviousStep());
        expect(result.current.currentStep).toBe(0);

        act(() => result.current.handlePreviousStep());
        expect(result.current.currentStep).toBe(0);
    });

    it('resolves the variant definitions of the product at the given step, honoring the combo subset', () => {
        const comboMural = {
            ...mural,
            id: 3,
            pivot: { variants: { Color: ['Negro'] } },
        } as unknown as SelectableProduct;
        const { result } = setup([mural, comboMural]);

        const plainColor = result.current
            .getDefinitions(0)
            .find((definition) => definition.label === 'Color');
        const comboColor = result.current
            .getDefinitions(1)
            .find((definition) => definition.label === 'Color');

        expect(plainColor?.options).toHaveLength(2);
        expect(comboColor?.options).toEqual([
            { label: 'Negro', color: '#1c1917' },
        ]);
    });
});
