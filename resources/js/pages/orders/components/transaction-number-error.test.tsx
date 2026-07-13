import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TransactionNumberError } from './transaction-number-error';

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

describe('TransactionNumberError', () => {
    it('renders nothing without a message', () => {
        const { container } = render(<TransactionNumberError />);

        expect(container.firstChild).toBeNull();
    });

    it('renders other validation errors as plain text', () => {
        render(
            <TransactionNumberError message="El número de transacción sólo puede contener letras y números." />,
        );

        expect(
            screen.getByText(
                'El número de transacción sólo puede contener letras y números.',
            ),
        ).not.toBeNull();
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('links to the order that already has the number', () => {
        render(
            <TransactionNumberError message="El número de transacción ya está registrado en el pedido #7." />,
        );

        const link = screen.getByRole('link', { name: 'pedido #7' });

        expect(link.getAttribute('href')).toBe(
            'http://localhost/orders.show/7',
        );
        expect(link.parentElement?.textContent).toBe(
            'El número de transacción ya está registrado en el pedido #7.',
        );
    });
});
