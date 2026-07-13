import { formatPrice } from '@/lib/utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OrderInfoCard } from './order-info-card';

vi.mock('@inertiajs/react', () => ({
    Link: ({
        href,
        children,
        className,
    }: {
        href: string;
        children?: ReactNode;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

// Intl formats with non-breaking spaces; RTL normalizes them to plain spaces
const price = (amount: number) => formatPrice(amount).replace(/\s/g, ' ');

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 5,
        total_price: 20000,
        paid_total: 20000,
        balance: 0,
        payment_plan: 2,
        due_date: '2026-08-01',
        status: 'terminado',
        can_edit: true,
        cancelled_at: null,
        child_name: null,
        photo_number: null,
        photo_url: null,
        client: { id: 1, name: 'Marta López' },
        classroom: { id: 2, name: 'Sala Roja' },
        school: { id: 3, name: 'Escuela 12' },
        products: [],
        ...overrides,
    }) as unknown as Order;

describe('OrderInfoCard', () => {
    it('links to the edit page when the order is editable', () => {
        render(<OrderInfoCard order={makeOrder()} onCancel={vi.fn()} />);

        expect(screen.getByRole('link').getAttribute('href')).toBe(
            'http://localhost/orders.edit/5',
        );
        expect(
            screen.queryByText(
                'La edición se bloquea cuando la primera cuota está pagada.',
            ),
        ).toBeNull();
    });

    it('disables editing when the first installment is paid', () => {
        render(
            <OrderInfoCard
                order={makeOrder({ can_edit: false })}
                onCancel={vi.fn()}
            />,
        );

        expect(screen.queryByRole('link')).toBeNull();
        expect(
            screen
                .getByTitle(
                    'La edición se bloquea cuando la primera cuota está pagada o el pedido está cancelado',
                )
                .getAttribute('aria-disabled'),
        ).toBe('true');
        expect(
            screen.getByText(
                'La edición se bloquea cuando la primera cuota está pagada.',
            ),
        ).toBeTruthy();
    });

    it('renders the status badge only when the order has a status', () => {
        const { rerender } = render(
            <OrderInfoCard
                order={makeOrder({ status: 'entregado parcial' })}
                onCancel={vi.fn()}
            />,
        );

        expect(screen.getByText('entregado parcial')).toBeTruthy();

        rerender(
            <OrderInfoCard
                order={makeOrder({ status: null })}
                onCancel={vi.fn()}
            />,
        );

        expect(screen.queryByText('entregado parcial')).toBeNull();
    });

    it('shows child and photo data only when assigned', () => {
        const { rerender } = render(
            <OrderInfoCard order={makeOrder()} onCancel={vi.fn()} />,
        );

        expect(screen.getByText('Pedido #5')).toBeTruthy();
        expect(screen.queryByText(/Niño\/a/)).toBeNull();
        expect(screen.queryByRole('img')).toBeNull();

        rerender(
            <OrderInfoCard
                order={makeOrder({
                    child_name: 'Luca',
                    photo_number: 0,
                    photo_url: 'http://localhost/photos/0.jpg',
                })}
                onCancel={vi.fn()}
            />,
        );

        expect(
            screen.getByText('Pedido #5 · Niño/a: Luca · Foto N° 0'),
        ).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Foto N° 0' })).toBeTruthy();
    });

    it('highlights the balance only while there is money pending', () => {
        const { rerender } = render(
            <OrderInfoCard
                order={makeOrder({ balance: 5000 })}
                onCancel={vi.fn()}
            />,
        );

        expect(screen.getByText(`Saldo: ${price(5000)}`).className).toContain(
            'text-amber-600',
        );

        rerender(<OrderInfoCard order={makeOrder()} onCancel={vi.fn()} />);

        expect(screen.getByText(`Saldo: ${price(0)}`).className).toContain(
            'text-green-600',
        );
    });

    it('cancels the order from the card action', () => {
        const onCancel = vi.fn();

        render(<OrderInfoCard order={makeOrder()} onCancel={onCancel} />);

        fireEvent.click(screen.getByText('Cancelar pedido'));

        expect(onCancel).toHaveBeenCalled();
    });

    it('replaces the cancel action with a notice once cancelled', () => {
        render(
            <OrderInfoCard
                order={makeOrder({
                    cancelled_at: '2026-07-01',
                    can_edit: false,
                })}
                onCancel={vi.fn()}
            />,
        );

        expect(
            screen.getByText('Pedido cancelado el 2026-07-01.'),
        ).toBeTruthy();
        expect(screen.queryByText('Cancelar pedido')).toBeNull();
        expect(
            screen.queryByText(
                'La edición se bloquea cuando la primera cuota está pagada.',
            ),
        ).toBeNull();
    });
});
