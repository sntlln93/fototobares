import { render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { StudentsTable } from './students-table';

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

const makeOrder = (overrides: Partial<Order> = {}): Order =>
    ({
        id: 7,
        photo_number: 12,
        child_name: 'Maylén Ortiz',
        total_price: 15000,
        payment_plan: 3,
        due_date: '2026-08-01',
        client: { id: 1, name: 'Marta López', phone: '3804000003' },
        products: [{}, {}],
        ...overrides,
    }) as unknown as Order;

describe('StudentsTable', () => {
    it('renders the child order number with a link to the order', () => {
        render(<StudentsTable orders={[makeOrder()]} />);

        const row = screen.getAllByRole('row')[1];

        expect(within(row).getByText('12')).toBeTruthy();
        expect(within(row).getByText('Maylén Ortiz')).toBeTruthy();
        expect(
            within(row).getByRole('link', { name: 'Ver' }).getAttribute('href'),
        ).toBe('http://localhost/orders.show/7');
    });

    it('falls back to a dash without an order number or child name', () => {
        render(
            <StudentsTable
                orders={[
                    makeOrder({ photo_number: null, child_name: undefined }),
                ]}
            />,
        );

        const row = screen.getAllByRole('row')[1];
        expect(within(row).getAllByText('—')).toHaveLength(2);
    });

    it('marks the searched order number', () => {
        const { container } = render(
            <StudentsTable orders={[makeOrder()]} search="12" />,
        );

        expect(container.querySelector('mark')?.textContent).toBe('12');
    });
});
