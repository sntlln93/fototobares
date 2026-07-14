import { render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ClassroomStudent, StudentsTable } from './students-table';

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
        `http://localhost/${name}/${params?.order ?? params?.draft ?? ''}`,
);

const makeStudent = (
    overrides: Partial<ClassroomStudent> = {},
): ClassroomStudent => ({
    kind: 'order',
    id: 7,
    photo_number: 12,
    child_name: 'Maylén Ortiz',
    client_name: 'Marta López',
    client_phone: '3804000003',
    products_count: 2,
    total_price: 15000,
    payment_plan: 3,
    due_date: '1 de ago 2026',
    ...overrides,
});

describe('StudentsTable', () => {
    it('renders the child order number with a link to the order', () => {
        render(<StudentsTable students={[makeStudent()]} />);

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
                students={[
                    makeStudent({ photo_number: null, child_name: null }),
                ]}
            />,
        );

        const row = screen.getAllByRole('row')[1];
        expect(within(row).getAllByText('—')).toHaveLength(2);
    });

    it('marks the searched order number', () => {
        const { container } = render(
            <StudentsTable students={[makeStudent()]} search="12" />,
        );

        expect(container.querySelector('mark')?.textContent).toBe('12');
    });

    it('shows a draft badge and a "Completar pedido" link with the draft id', () => {
        render(
            <StudentsTable
                students={[
                    makeStudent({ kind: 'draft', id: 3, photo_number: 5 }),
                ]}
            />,
        );

        const row = screen.getAllByRole('row')[1];

        expect(within(row).getByText('Borrador')).toBeTruthy();
        expect(
            within(row)
                .getByRole('link', { name: 'Completar pedido' })
                .getAttribute('href'),
        ).toBe('http://localhost/orders.create/3');
    });

    it('does not collide keys when an order and a draft share the same id', () => {
        render(
            <StudentsTable
                students={[
                    makeStudent({ kind: 'order', id: 1, photo_number: 1 }),
                    makeStudent({ kind: 'draft', id: 1, photo_number: 2 }),
                ]}
            />,
        );

        expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 rows
    });
});
