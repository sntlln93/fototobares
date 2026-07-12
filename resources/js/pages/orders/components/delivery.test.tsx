import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeliveryCard } from './delivery';

vi.mock('@inertiajs/react', () => ({
    router: { put: vi.fn() },
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const put = vi.mocked(router.put);

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 1,
        total_price: 12000,
        balance: 0,
        products: [
            {
                order_detail_id: 11,
                name: 'Mural',
                delivered_at: null,
                production_status: 'Impreso',
                recycled_to: null,
            },
            {
                order_detail_id: 12,
                name: 'Taza',
                delivered_at: null,
                production_status: null,
                recycled_to: null,
            },
        ],
        ...overrides,
    }) as unknown as Order;

beforeEach(() => {
    put.mockReset();
});

describe('DeliveryCard', () => {
    it('delivers everything directly when there is no pending balance', () => {
        render(<DeliveryCard order={makeOrder()} onPayBalance={vi.fn()} />);

        fireEvent.click(screen.getByText('Entregar todo'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/1',
            { detail_ids: [11, 12], action: 'deliver' },
            expect.anything(),
        );
    });

    it('warns before delivering when the order is not fully paid', () => {
        render(
            <DeliveryCard
                order={makeOrder({ balance: 5000 })}
                onPayBalance={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByText('Entregar todo'));

        expect(
            screen.getByText('Este pedido no está pagado al 100%'),
        ).toBeTruthy();
        expect(put).not.toHaveBeenCalled();

        // The warning is ignorable
        fireEvent.click(screen.getByText('Entregar igualmente'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/1',
            { detail_ids: [11, 12], action: 'deliver' },
            expect.anything(),
        );
    });

    it('hands off to the payment flow from the warning', () => {
        const onPayBalance = vi.fn();

        render(
            <DeliveryCard
                order={makeOrder({ balance: 5000 })}
                onPayBalance={onPayBalance}
            />,
        );

        fireEvent.click(screen.getByText('Entregar todo'));
        fireEvent.click(screen.getByText(/Cancelar saldo/));

        expect(onPayBalance).toHaveBeenCalled();
        expect(put).not.toHaveBeenCalled();
    });

    it('delivers only the selected products', () => {
        render(<DeliveryCard order={makeOrder()} onPayBalance={vi.fn()} />);

        fireEvent.click(screen.getByLabelText('Mural'));
        fireEvent.click(screen.getByText('Entregar seleccionados (1)'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/1',
            { detail_ids: [11], action: 'deliver' },
            expect.anything(),
        );
    });

    it('can undo a delivered product', () => {
        const order = makeOrder();
        (order.products[0] as OrderProduct).delivered_at = '2026-07-06';

        render(<DeliveryCard order={order} onPayBalance={vi.fn()} />);

        expect(screen.getByText('Entregado')).toBeTruthy();

        fireEvent.click(screen.getByTitle('Deshacer entrega'));

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.delivery/1',
            { detail_ids: [11], action: 'undeliver' },
            expect.anything(),
        );
    });

    it('excludes recycled products from the delivery list', () => {
        const order = makeOrder();
        (order.products[1] as OrderProduct).recycled_to = 'reciclaje';

        render(<DeliveryCard order={order} onPayBalance={vi.fn()} />);

        expect(screen.queryByText('Taza')).toBeNull();
        expect(screen.getByText('Mural')).toBeTruthy();
    });
});
