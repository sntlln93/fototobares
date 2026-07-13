import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Details } from './details';

vi.mock('@inertiajs/react', () => ({
    router: { put: vi.fn() },
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const put = vi.mocked(router.put);

const makeProduct = (overrides: Partial<OrderProduct> = {}): OrderProduct =>
    ({
        id: 5,
        order_detail_id: 11,
        name: 'Mural',
        type: { id: 1, name: 'cuadro' },
        product_type_id: 1,
        unit_price: 10000,
        financed_price: 12000,
        max_payments: 3,
        delivered_at: null,
        recycled_to: null,
        priority: false,
        production_status: 'Impreso',
        ...overrides,
    }) as unknown as OrderProduct;

const makeOrder = (
    products: OrderProduct[],
    overrides: Partial<Order> = {},
): Order =>
    ({
        id: 1,
        products,
        cancelled_at: null,
        ...overrides,
    }) as unknown as Order;

beforeEach(() => {
    put.mockReset();
});

describe('Details', () => {
    it('prioritizes a detail', () => {
        render(<Details order={makeOrder([makeProduct()])} />);

        fireEvent.click(screen.getByText('Priorizar'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.priority/1',
            { detail_id: 11, priority: true },
            expect.anything(),
        );
    });

    it('shows the badge and unflags an already prioritized detail', () => {
        render(
            <Details order={makeOrder([makeProduct({ priority: true })])} />,
        );

        expect(screen.getByText('Prioridad')).toBeTruthy();

        fireEvent.click(screen.getByText('Quitar prioridad'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.priority/1',
            { detail_id: 11, priority: false },
            expect.anything(),
        );
    });

    it('hides the toggle for delivered, recycled and cancelled details', () => {
        const { rerender } = render(
            <Details
                order={makeOrder([
                    makeProduct({ delivered_at: '2026-07-01T00:00:00Z' }),
                ])}
            />,
        );

        expect(screen.queryByText('Priorizar')).toBeNull();

        rerender(
            <Details
                order={makeOrder([makeProduct({ recycled_to: 'stock' })])}
            />,
        );

        expect(screen.queryByText('Priorizar')).toBeNull();

        rerender(
            <Details
                order={makeOrder([makeProduct()], {
                    cancelled_at: '2026-07-01T00:00:00Z',
                })}
            />,
        );

        expect(screen.queryByText('Priorizar')).toBeNull();
    });
});
