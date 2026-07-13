import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductOrder, SelectableProduct } from '../form';
import { useAddDetail } from '../hooks/use-add-detail';

const muralVariants = {
    photo_types: ['individual', 'grupo'],
    orientations: ['vertical', 'horizontal'],
    backgrounds: ['blue'],
    colors: ['brown'],
    dimentions: '30x40',
};

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
        result.current.updateProductData('orientation', productId, 'vertical');
        result.current.updateProductData('photoType', productId, 'individual');
        result.current.updateProductData('background', productId, 'blue');
        result.current.updateProductData('color', productId, 'brown');
        result.current.updateProductData('note', productId, 'Emma');
    });
};

describe('useAddDetail', () => {
    it('stores per-product values and replaces them on update', () => {
        const { result } = setup([mural, taza]);

        expect(result.current.getProductValue(1, 'note')).toBeUndefined();

        act(() => {
            result.current.updateProductData('note', 1, 'Emma');
            result.current.updateProductData('note', 2, 'Luca');
        });

        expect(result.current.getProductValue(1, 'note')).toBe('Emma');
        expect(result.current.getProductValue(2, 'note')).toBe('Luca');

        act(() => result.current.updateProductData('note', 1, 'Emma B.'));

        expect(result.current.getProductValue(1, 'note')).toBe('Emma B.');
        expect(result.current.getProductValue(2, 'note')).toBe('Luca');
    });

    it('blocks adding while a mural is incomplete', () => {
        const { result, addProducts, onClose } = setup([mural]);

        act(() => result.current.handleAddProduct());

        expect(addProducts).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(Object.keys(result.current.errors[1])).toEqual([
            'orientation',
            'photoType',
            'background',
            'color',
            'note',
        ]);
    });

    it('clears each field error as a valid value arrives, per product', () => {
        const secondMural = { ...mural, id: 9 } as SelectableProduct;
        const { result } = setup([mural, secondMural]);

        act(() => result.current.handleAddProduct());

        expect(Object.keys(result.current.errors)).toEqual(['1', '9']);

        act(() =>
            result.current.updateProductData('orientation', 1, 'vertical'),
        );

        expect(result.current.errors[1].orientation).toBeUndefined();
        expect(result.current.errors[1].note).toBeDefined();

        fillMural(result, 1);

        // The completed mural drops out; the other product keeps its errors
        expect(result.current.errors[1]).toBeUndefined();
        expect(result.current.errors[9]).toBeDefined();
    });

    it('keeps the error when the new value is empty', () => {
        const { result } = setup([mural]);

        act(() => result.current.handleAddProduct());
        act(() => result.current.updateProductData('note', 1, ''));

        expect(result.current.getProductValue(1, 'note')).toBe('');
        expect(result.current.errors[1].note).toBeDefined();
    });

    it('adds a completed mural with its variant payload and closes', () => {
        const { result, addProducts, onClose } = setup([mural]);

        fillMural(result, 1);
        act(() => result.current.handleAddProduct());

        expect(result.current.errors).toEqual({});
        expect(addProducts).toHaveBeenCalledWith([
            {
                combo_id: undefined,
                product_id: 1,
                variant: {
                    orientation: 'vertical',
                    photo_type: 'individual',
                    background: 'blue',
                    color: 'brown',
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
                    orientation: 'horizontal',
                    photo_type: 'grupo',
                    background: 'blue',
                    color: 'brown',
                },
            },
        ];
        const { result, addProducts, onClose } = setup([mural], initialValues);

        expect(result.current.getProductValue(1, 'orientation')).toBe(
            'horizontal',
        );
        expect(result.current.getProductValue(1, 'note')).toBe('Mural de Emma');

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

    it('resolves the variants of the product at the given step', () => {
        const comboMural = {
            ...mural,
            id: 3,
            pivot: { variants: { ...muralVariants, backgrounds: ['white'] } },
        } as unknown as SelectableProduct;
        const { result } = setup([mural, comboMural]);

        expect(result.current.getVariants(0)?.backgrounds).toEqual(['blue']);
        expect(result.current.getVariants(1)?.backgrounds).toEqual(['white']);
    });
});
