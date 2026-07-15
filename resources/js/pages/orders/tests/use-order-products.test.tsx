import { InertiaFormProps } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ComboProduct, ComboWithProducts, ProductOrder } from '../form';
import { emptyForm, OrderFormData } from '../form-state';
import { useOrderProducts } from '../hooks/use-order-products';

const toast = vi.hoisted(() => ({ info: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

const catalogVariants: VariantDefinition[] = [
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
        options: [
            { label: 'Celeste', color: '#93c5fd' },
            { label: 'Blanco', color: '#ffffff' },
        ],
    },
];

const mural = {
    id: 1,
    name: 'Mural clásico',
    product_type_id: 1,
    unit_price: 40000,
    variants: catalogVariants,
} as unknown as Product;

const taza = {
    id: 2,
    name: 'Taza',
    product_type_id: 2,
    unit_price: 12000,
} as Product;

const portarretrato = {
    id: 3,
    name: 'Portarretrato',
    product_type_id: 3,
    unit_price: 15000,
} as Product;

const pivot = (subtractValue: number) => ({
    quantity: 1,
    subtract_value: subtractValue,
});

// Same mural, restricted by the combo pivot to a single background
const comboMural = {
    ...mural,
    pivot: { ...pivot(9000), variants: { Fondo: ['Celeste'] } },
} as unknown as ComboProduct;

const comboTaza = { ...taza, pivot: pivot(3000) } as ComboProduct;

// The premium combo carries two portarretratos
const comboPortarretrato = {
    ...portarretrato,
    pivot: { quantity: 2, subtract_value: 4000 },
} as ComboProduct;

const combo = {
    id: 4,
    name: 'Combo escolar',
    suggested_price: 15000,
    default_payments: 3,
    products: [comboMural, comboTaza],
} as ComboWithProducts;

const otherCombo = {
    id: 5,
    name: 'Combo premium',
    suggested_price: 20000,
    default_payments: 4,
    products: [comboTaza, comboPortarretrato],
} as ComboWithProducts;

const setup = (details: ProductOrder[] = []) => {
    const setData = vi.fn();

    const data: OrderFormData = {
        ...emptyForm(),
        total_price: '12000',
        payment_plan: '1',
        order_details: details,
    };

    const { result } = renderHook(() =>
        useOrderProducts({
            data,
            setData:
                setData as unknown as InertiaFormProps<OrderFormData>['setData'],
            products: [mural, taza, portarretrato],
            combos: [combo, otherCombo],
        }),
    );

    /** The form values left by the last cart mutation */
    const applied = (): OrderFormData => {
        const updater = (setData as Mock).mock.calls.at(-1)?.[0] as (
            current: OrderFormData,
        ) => OrderFormData;

        return updater(data);
    };

    return { result, setData, applied };
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

    it('opens the combo products tagged with the combo without touching the price', () => {
        const { result, setData } = setup();

        act(() => result.current.handleAddCombo(4));

        expect(result.current.openAddModal).toEqual([
            { ...comboMural, combo_id: 4 },
            { ...comboTaza, combo_id: 4 },
        ]);
        // Regression (#100): the price used to be added here, so picking a
        // second combo accumulated on top of the first
        expect(setData).not.toHaveBeenCalled();
    });

    it('appends the configured products and derives the total from the cart', () => {
        const existing: ProductOrder = { product_id: 2, note: 'Taza de Luca' };
        const added: ProductOrder[] = [
            { product_id: 1, note: 'Mural de Emma', combo_id: 4 },
            { product_id: 2, note: 'Taza de Emma', combo_id: 4 },
        ];
        const { result, applied } = setup([existing]);

        act(() => result.current.setProductsOrder(added));

        expect(applied().order_details).toEqual([existing, ...added]);
        // Combo 15000 + the standalone taza 12000, ignoring the old total
        expect(applied().total_price).toBe('27000');
    });

    it('adds one detail per unit when the combo carries several of a product', () => {
        const { result, applied } = setup();
        const detail = { product_id: 3, combo_id: 5, note: 'Foto de Emma' };

        act(() => result.current.setProductsOrder([detail]));

        // The combo carries 2 portarretratos: same variants and note, two units
        expect(applied().order_details).toEqual([detail, detail]);
    });

    it('does not multiply the units again when the detail is edited', () => {
        const detail = { product_id: 3, combo_id: 5, note: 'Foto de Emma' };
        const { result, applied } = setup([detail, detail]);

        act(() => result.current.handleEditProduct(0));
        act(() =>
            result.current.setProductsOrder([
                { ...detail, note: 'Foto de Emma R.' },
            ]),
        );

        expect(applied().order_details).toEqual([
            { ...detail, note: 'Foto de Emma R.' },
            detail,
        ]);
    });

    it('seeds the installments with the default of the first combo added', () => {
        const { result, applied } = setup();

        act(() =>
            result.current.setProductsOrder([
                { product_id: 2, combo_id: 4, note: '' },
            ]),
        );

        expect(applied().payment_plan).toBe('3');
    });

    it('keeps the installments when a second combo is added', () => {
        const { result, applied } = setup([
            { product_id: 2, combo_id: 4, note: '' },
        ]);

        act(() =>
            result.current.setProductsOrder([
                { product_id: 2, combo_id: 5, note: '' },
            ]),
        );

        expect(applied().payment_plan).toBe('1');
    });

    it('replaces the edited detail in place and leaves edit mode', () => {
        const details: ProductOrder[] = [
            { product_id: 2, note: 'Taza de Luca' },
            { product_id: 3, note: 'Portarretrato de Luca' },
        ];
        const { result, applied } = setup(details);

        act(() => result.current.handleEditProduct(0));

        expect(result.current.editingIndex).toBe(0);
        expect(result.current.openAddModal).toEqual([taza]);

        act(() =>
            result.current.setProductsOrder([
                { product_id: 2, note: 'Taza de Lucas' },
            ]),
        );

        expect(applied().order_details).toEqual([
            { product_id: 2, note: 'Taza de Lucas' },
            details[1],
        ]);
        expect(result.current.editingIndex).toBeNull();
    });

    it('edits a combo item with the pivot-restricted product, not the catalog one', () => {
        const { result } = setup([
            { product_id: 1, combo_id: 4, note: 'Mural de Emma' },
        ]);

        act(() => result.current.handleEditProduct(0));

        const opened = result.current.openAddModal?.[0] as
            (ComboProduct & { combo_id?: number }) | undefined;

        expect(result.current.editingIndex).toBe(0);
        expect(opened?.combo_id).toBe(4);
        expect(opened?.pivot?.variants).toEqual({
            Fondo: ['Celeste'],
        });
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

    it('subtracts the configured value when a combo product is removed', () => {
        const details: ProductOrder[] = [
            { product_id: 1, combo_id: 4, note: '' },
            { product_id: 2, combo_id: 4, note: '' },
        ];
        const { result, applied } = setup(details);

        act(() => result.current.handleRemoveProduct(1));

        expect(applied().order_details).toEqual([details[0]]);
        // 15000 − 3000 (the taza subtract value), not − 12000 (its price)
        expect(applied().total_price).toBe('12000');
        expect(toast.info).toHaveBeenCalledWith(
            expect.stringContaining('precio'),
        );
    });

    it('removes every detail of a combo and drops its price', () => {
        const details: ProductOrder[] = [
            { product_id: 1, combo_id: 4, note: '' },
            { product_id: 2, combo_id: 4, note: '' },
            { product_id: 3, note: 'Portarretrato suelto' },
        ];
        const { result, applied } = setup(details);

        act(() => result.current.handleRemoveCombo(4));

        expect(applied().order_details).toEqual([details[2]]);
        // Only the standalone portarretrato is left
        expect(applied().total_price).toBe('15000');
    });

    it('exposes the breakdown and restores the calculated price on demand', () => {
        const { result, setData } = setup([
            { product_id: 1, combo_id: 4, note: '' },
            { product_id: 2, combo_id: 4, note: '' },
        ]);

        expect(result.current.breakdown).toEqual({
            lines: [{ label: 'Combo escolar', amount: 15000 }],
            total: 15000,
        });

        act(() => result.current.recalculatePrice());

        expect(setData).toHaveBeenCalledWith('total_price', '15000');
    });
});
