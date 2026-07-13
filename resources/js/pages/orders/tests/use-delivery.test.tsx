import { router } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDelivery } from '../hooks/use-delivery';

vi.mock('@inertiajs/react', () => ({
    router: { put: vi.fn() },
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const put = vi.mocked(router.put);

const lastPutOptions = () =>
    put.mock.calls.at(-1)?.[2] as unknown as {
        preserveScroll?: boolean;
        onSuccess?: () => void;
        onError?: () => void;
    };

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 9,
        balance: 0,
        products: [
            { order_detail_id: 11, delivered_at: null, recycled_to: null },
            { order_detail_id: 12, delivered_at: null, recycled_to: null },
            {
                order_detail_id: 13,
                delivered_at: '2026-07-01',
                recycled_to: null,
            },
            { order_detail_id: 14, delivered_at: null, recycled_to: 'stock' },
        ],
        ...overrides,
    }) as unknown as Order;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useDelivery', () => {
    it('splits products into undelivered and delivered, skipping recycled ones', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        expect(
            result.current.undelivered.map((p) => p.order_detail_id),
        ).toEqual([11, 12]);
        expect(result.current.delivered.map((p) => p.order_detail_id)).toEqual([
            13,
        ]);
    });

    it('defaults the balance to zero when the order has none', () => {
        const { result } = renderHook(() =>
            useDelivery(makeOrder({ balance: undefined })),
        );

        expect(result.current.balance).toBe(0);
    });

    it('toggles a detail in and out of the selection', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        act(() => result.current.toggle(11));
        act(() => result.current.toggle(12));
        expect(result.current.selected).toEqual([11, 12]);

        act(() => result.current.toggle(11));
        expect(result.current.selected).toEqual([12]);
    });

    it('rejects a delivery request without selected products', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        act(() => result.current.requestDelivery([]));

        expect(toast.error).toHaveBeenCalledWith(
            'Seleccioná al menos un producto para entregar',
        );
        expect(put).not.toHaveBeenCalled();
        expect(result.current.pendingDelivery).toBeNull();
    });

    it('holds the delivery as pending when there is an unpaid balance', () => {
        const { result } = renderHook(() =>
            useDelivery(makeOrder({ balance: 5000 })),
        );

        act(() => result.current.requestDelivery([11, 12]));

        expect(result.current.pendingDelivery).toEqual([11, 12]);
        expect(put).not.toHaveBeenCalled();
    });

    it('delivers immediately when the order is fully paid', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        act(() => result.current.requestDelivery([11, 12]));

        expect(result.current.pendingDelivery).toBeNull();
        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/9',
            { detail_ids: [11, 12], action: 'deliver' },
            expect.objectContaining({ preserveScroll: true }),
        );
    });

    it('clears the selection and pending warning after a successful delivery', () => {
        const { result } = renderHook(() =>
            useDelivery(makeOrder({ balance: 5000 })),
        );

        act(() => result.current.toggle(11));
        act(() => result.current.requestDelivery([11]));
        // The warning is ignorable: deliver anyway
        act(() => result.current.deliver([11]));
        act(() => lastPutOptions().onSuccess?.());

        expect(result.current.selected).toEqual([]);
        expect(result.current.pendingDelivery).toBeNull();
        expect(toast.success).toHaveBeenCalledWith('Entrega registrada');
    });

    it('reports the failure and keeps the selection when the delivery errors', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        act(() => result.current.toggle(11));
        act(() => result.current.deliver([11]));
        act(() => lastPutOptions().onError?.());

        expect(toast.error).toHaveBeenCalledWith(
            'No se pudo registrar la entrega',
        );
        expect(result.current.selected).toEqual([11]);
    });

    it('undoes a single delivery and confirms it', () => {
        const { result } = renderHook(() => useDelivery(makeOrder()));

        act(() => result.current.undo(13));
        act(() => lastPutOptions().onSuccess?.());

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/9',
            { detail_ids: [13], action: 'undeliver' },
            expect.objectContaining({ preserveScroll: true }),
        );
        expect(toast.success).toHaveBeenCalledWith('Entrega deshecha');
    });
});
