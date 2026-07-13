import { act, renderHook } from '@testing-library/react';
import { FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditOrder } from '../hooks/use-edit-order';

const put = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/react', () => ({
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        put,
        processing: false,
        errors: {},
    }),
}));

const toast = vi.hoisted(() => ({ success: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const makeEvent = () => {
    const preventDefault = vi.fn();
    return {
        event: { preventDefault } as unknown as FormEvent,
        preventDefault,
    };
};

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 7,
        client: { name: 'Carla López', phone: '3804123456' },
        child_name: 'Benjamín',
        attended_photo_session: true,
        total_price: 25000,
        payment_plan: 3,
        due_date: '2026-08-15',
        classroom_id: 4,
        products: [
            { id: 2, note: 'sin marco', variant: { color: 'negro' } },
            { id: 5, note: null },
        ],
        ...overrides,
    }) as unknown as Order;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useEditOrder', () => {
    it('builds the form from the order, stringifying prices and mapping details', () => {
        const { result } = renderHook(() => useEditOrder(makeOrder()));

        expect(result.current.data).toEqual({
            name: 'Carla López',
            phone: '3804123456',
            child_name: 'Benjamín',
            attended_photo_session: true,
            total_price: '25000',
            payment_plan: '3',
            due_date: '2026-08-15',
            classroom_id: 4,
            order_details: [
                {
                    product_id: 2,
                    note: 'sin marco',
                    variant: { color: 'negro' },
                },
                { product_id: 5, note: null, variant: {} },
            ],
        });
    });

    it('falls back to empty client fields and a null session flag', () => {
        const order = makeOrder({
            client: undefined,
            child_name: undefined,
            attended_photo_session: undefined,
        });

        const { result } = renderHook(() => useEditOrder(order));

        expect(result.current.data).toMatchObject({
            name: '',
            phone: '',
            child_name: '',
            attended_photo_session: null,
        });
    });

    it('starts on the client step and opens the requested one', () => {
        const { result } = renderHook(() => useEditOrder(makeOrder()));

        expect(result.current.accordionValue).toBe('client');

        const { event, preventDefault } = makeEvent();
        act(() => result.current.toStep('products')(event));

        expect(result.current.accordionValue).toBe('products');
        expect(preventDefault).toHaveBeenCalled();
    });

    it('collapses the accordion when re-selecting the open step', () => {
        const { result } = renderHook(() => useEditOrder(makeOrder()));

        act(() => result.current.toStep('client')(makeEvent().event));

        expect(result.current.accordionValue).toBeUndefined();
    });

    it('submits the update and confirms on success', () => {
        const { result } = renderHook(() => useEditOrder(makeOrder()));

        const { event, preventDefault } = makeEvent();
        act(() => result.current.submit(event));

        expect(preventDefault).toHaveBeenCalled();
        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.update/7',
            expect.anything(),
        );

        const options = put.mock.calls[0][1] as { onSuccess: () => void };
        options.onSuccess();

        expect(toast.success).toHaveBeenCalledWith(
            'Pedido actualizado exitosamente',
        );
    });
});
