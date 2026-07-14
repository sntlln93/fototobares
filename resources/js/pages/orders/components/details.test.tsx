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
        production_status_id: 21,
        production_enabled: true,
        statuses: [{ id: 21, name: 'Impreso', position: 1 }],
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
        first_installment_paid: true,
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

    it('shows "Sin habilitar" and enables production from the badge area', () => {
        render(
            <Details
                order={makeOrder([
                    makeProduct({
                        production_enabled: false,
                        production_status: null,
                        production_status_id: null,
                    }),
                ])}
            />,
        );

        expect(screen.getByText('Sin habilitar')).toBeTruthy();

        fireEvent.click(screen.getByText('Habilitar fabricación'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.production-status/1',
            { detail_id: 11, production_status_id: null },
            expect.anything(),
        );
    });

    it('only explains the gate while the first installment is unpaid', () => {
        render(
            <Details
                order={makeOrder(
                    [
                        makeProduct({
                            production_enabled: false,
                            production_status: null,
                            production_status_id: null,
                        }),
                    ],
                    { first_installment_paid: false },
                )}
            />,
        );

        expect(screen.queryByText('Habilitar fabricación')).toBeNull();
        expect(
            screen.getByText(/se habilita cuando la primera cuota está paga/),
        ).toBeTruthy();
    });
});
