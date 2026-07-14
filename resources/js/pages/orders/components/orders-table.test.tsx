import { onSort } from '@/lib/services/filter';
import { formatPrice } from '@/lib/utils';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersTable } from './orders-table';

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

vi.mock('@/lib/services/filter', () => ({
    onSort: vi.fn(),
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? params?.school ?? ''}`,
);

const sort = vi.mocked(onSort);

// Intl formats with non-breaking spaces; RTL normalizes them to plain spaces
const price = (amount: number) => formatPrice(amount).replace(/\s/g, ' ');

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 7,
        total_price: 15000,
        payment_plan: 3,
        due_date: '2026-08-01',
        can_delete: true,
        client: { id: 1, name: 'Marta López' },
        classroom: { id: 2, name: 'Sala Roja' },
        school: { id: 3, name: 'Escuela 12' },
        products: [{}, {}],
        ...overrides,
    }) as unknown as Order;

beforeEach(() => {
    sort.mockReset();
});

describe('OrdersTable', () => {
    it('renders each order with its totals and navigation links', () => {
        render(<OrdersTable orders={[makeOrder()]} onDelete={vi.fn()} />);

        const row = screen.getAllByRole('row')[1];

        expect(within(row).getByText('Marta López')).toBeTruthy();
        expect(within(row).getByText(price(15000))).toBeTruthy();
        expect(within(row).getByText(`3 (${price(5000)})`)).toBeTruthy();
        expect(within(row).getByText(/Sala Roja/)).toBeTruthy();

        const [schoolLink, showLink] = within(row).getAllByRole('link');
        expect(schoolLink.textContent).toBe('Escuela 12');
        expect(schoolLink.getAttribute('href')).toBe(
            'http://localhost/schools.show/3',
        );
        expect(showLink.getAttribute('href')).toBe(
            'http://localhost/orders.show/7',
        );
    });

    it('allows deleting an order without payments', () => {
        const onDelete = vi.fn();
        const order = makeOrder();

        render(<OrdersTable orders={[order]} onDelete={onDelete} />);

        const button = screen.getByTitle<HTMLButtonElement>('Eliminar pedido');
        expect(button.disabled).toBe(false);

        fireEvent.click(button);

        expect(onDelete).toHaveBeenCalledWith(order);
    });

    it('blocks deleting an order with registered payments', () => {
        const onDelete = vi.fn();

        render(
            <OrdersTable
                orders={[makeOrder({ can_delete: false })]}
                onDelete={onDelete}
            />,
        );

        const button = screen.getByTitle<HTMLButtonElement>(
            'No se puede eliminar un pedido con pagos registrados',
        );
        expect(button.disabled).toBe(true);

        fireEvent.click(button);

        expect(onDelete).not.toHaveBeenCalled();
    });

    it('sorts by id and price from the header buttons', () => {
        render(<OrdersTable orders={[]} onDelete={vi.fn()} />);

        const headers = screen.getAllByRole('columnheader');
        const header = (name: string) =>
            headers.find((columnheader) =>
                columnheader.textContent?.includes(name),
            )!;

        fireEvent.click(within(header('#')).getByRole('button'));
        expect(sort).toHaveBeenCalledWith('id', 'orders.index');

        fireEvent.click(within(header('Precio')).getByRole('button'));
        expect(sort).toHaveBeenCalledWith('total_price', 'orders.index');
    });

    it('shows the client phone with a link to their whatsapp chat', () => {
        render(
            <OrdersTable
                orders={[
                    makeOrder({
                        client: { name: 'Marta López', phone: '3804000003' },
                    }),
                ]}
                onDelete={vi.fn()}
            />,
        );

        const row = screen.getAllByRole('row')[1];
        const chat = within(row).getByRole('link', {
            name: 'Abrir chat de WhatsApp con 3804000003',
        });

        expect(chat.getAttribute('href')).toBe('https://wa.me/5493804000003');
    });

    it('marks the searched phone in the row it matched', () => {
        const { container } = render(
            <OrdersTable
                orders={[
                    makeOrder({
                        client: { name: 'Marta López', phone: '3804000003' },
                    }),
                ]}
                search="+54 9 3804000003"
                onDelete={vi.fn()}
            />,
        );

        expect(container.querySelector('mark')?.textContent).toBe('3804000003');
    });
});
