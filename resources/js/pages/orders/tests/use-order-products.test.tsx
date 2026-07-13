import { InertiaFormProps } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductOrder } from '../form';
import { emptyForm, OrderFormData } from '../form-state';
import { useOrderProducts } from '../hooks/use-order-products';

const toast = vi.hoisted(() => ({ info: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

const catalogVariants = {
    photo_types: ['individual', 'grupo'],
    orientations: ['vertical', 'horizontal'],
    backgrounds: ['blue', 'white'],
    colors: ['brown'],
    dimentions: '30x40',
};

const mural = {
    id: 1,
    name: 'Mural clásico',
    product_type_id: 1,
    variants: catalogVariants,
} as unknown as Product;

const taza = { id: 2, name: 'Taza', product_type_id: 2 } as Product;

const portarretrato = {
    id: 3,
    name: 'Portarretrato',
    product_type_id: 3,
} as Product;

// Same mural but restricted by the combo pivot to a single background
const comboMural = {
    ...mural,
    variants: { ...catalogVariants, backgrounds: ['blue'] },
} as unknown as Product;

const combo = {
    id: 4,
    name: 'Combo escolar',
    suggested_price: 15000,
    products: [comboMural, taza],
} as unknown as Combo & { products: Product[] };

const setup = (details: ProductOrder[] = []) => {
    const setData = vi.fn();

    const { result } = renderHook(() =>
        useOrderProducts({
            data: {
                ...emptyForm(),
                total_price: '12000',
                order_details: details,
            },
            setData:
                setData as unknown as InertiaFormProps<OrderFormData>['setData'],
            products: [mural, taza, portarretrato],
            combos: [combo],
        }),
    );

    return { result, setData };
};

describe('useOrderProducts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('opens the add modal with the selected catalog product', () => {
        const { result, setData } = setup();

        act(() => result.current.handleAddProduct(2));

        expect(result.current.openAddModal).toEqual([taza]);
        expect(setData).not.toHaveBeenCalled();
    });

    it('sums the combo price into the total and opens its products tagged with the combo', () => {
        const { result, setData } = setup();

        act(() => result.current.handleAddCombo(4));

        expect(setData).toHaveBeenCalledWith('total_price', '27000');
        expect(result.current.openAddModal).toEqual([
            { ...comboMural, combo_id: 4 },
            { ...taza, combo_id: 4 },
        ]);
    });

    it('appends the configured products to the order details', () => {
        const existing: ProductOrder = { product_id: 2, note: 'Taza de Luca' };
        const added: ProductOrder[] = [
            { product_id: 1, note: 'Mural de Emma' },
            { product_id: 2, note: 'Taza de Emma', combo_id: 4 },
        ];
        const { result, setData } = setup([existing]);

        act(() => result.current.setProductsOrder(added));

        expect(setData).toHaveBeenCalledWith('order_details', [
            existing,
            ...added,
        ]);
    });

    it('replaces the edited detail in place and leaves edit mode', () => {
        const details: ProductOrder[] = [
            { product_id: 2, note: 'Taza de Luca' },
            { product_id: 3, note: 'Portarretrato de Luca' },
        ];
        const { result, setData } = setup(details);

        act(() => result.current.handleEditProduct(0));

        expect(result.current.editingIndex).toBe(0);
        expect(result.current.openAddModal).toEqual([taza]);

        act(() =>
            result.current.setProductsOrder([
                { product_id: 2, note: 'Taza de Lucas' },
            ]),
        );

        expect(setData).toHaveBeenLastCalledWith('order_details', [
            { product_id: 2, note: 'Taza de Lucas' },
            details[1],
        ]);
        expect(result.current.editingIndex).toBeNull();

        // Once edit mode is cleared, saving appends again
        act(() =>
            result.current.setProductsOrder([
                { product_id: 1, note: 'Mural de Emma' },
            ]),
        );

        expect(setData).toHaveBeenLastCalledWith('order_details', [
            ...details,
            { product_id: 1, note: 'Mural de Emma' },
        ]);
    });

    it('edits a combo item with the pivot-restricted product, not the catalog one', () => {
        const { result } = setup([
            { product_id: 1, combo_id: 4, note: 'Mural de Emma' },
        ]);

        act(() => result.current.handleEditProduct(0));

        expect(result.current.editingIndex).toBe(0);
        expect(result.current.openAddModal?.[0].combo_id).toBe(4);
        expect(result.current.openAddModal?.[0].variants?.backgrounds).toEqual([
            'blue',
        ]);
    });

    it('falls back to the catalog when the combo does not carry the product', () => {
        const { result } = setup([{ product_id: 3, combo_id: 4, note: '' }]);

        act(() => result.current.handleEditProduct(0));

        expect(result.current.openAddModal).toEqual([
            { ...portarretrato, combo_id: 4 },
        ]);
    });

    it('ignores editing a detail whose product no longer exists', () => {
        const { result } = setup([{ product_id: 99, note: '' }]);

        act(() => result.current.handleEditProduct(0));

        expect(result.current.openAddModal).toBeNull();
        expect(result.current.editingIndex).toBeNull();
    });

    it('removes the detail and reminds about reviewing the price', () => {
        const details: ProductOrder[] = [
            { product_id: 1, note: 'Mural de Emma' },
            { product_id: 2, note: 'Taza de Emma' },
        ];
        const { result, setData } = setup(details);

        act(() => result.current.handleRemoveProduct(0));

        expect(setData).toHaveBeenCalledWith('order_details', [details[1]]);
        expect(toast.info).toHaveBeenCalledWith(
            expect.stringContaining('precio'),
        );
    });
});
