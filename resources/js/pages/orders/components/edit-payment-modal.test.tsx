import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditPaymentModal } from './edit-payment-modal';

const inertia = vi.hoisted(() => ({
    put: vi.fn(),
    errors: {} as Record<string, string>,
}));

vi.mock('@inertiajs/react', () => ({
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        put: inertia.put,
        processing: false,
        errors: inertia.errors,
    }),
    Link: ({ href, children }: { href: string; children?: ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.stubGlobal('route', (name: string, params?: unknown) => {
    if (typeof params === 'number') {
        return `http://localhost/${name}/${params}`;
    }

    const order = (params as Record<string, unknown> | undefined)?.order;

    return order !== undefined
        ? `http://localhost/${name}/${order}`
        : `http://localhost/${name}`;
});

const makePayment = (overrides: Partial<Payment> = {}): Payment => ({
    id: 3,
    order_id: 1,
    amount: 5000,
    type: 'transferencia',
    transaction_number: 'MP12345678',
    paid_at: 'hace 2 días',
    ...overrides,
});

beforeEach(() => {
    inertia.put.mockReset();
    inertia.errors = {};
});

describe('EditPaymentModal', () => {
    it('prefills the transfer with its transaction number', () => {
        render(
            <EditPaymentModal payment={makePayment()} show onClose={vi.fn()} />,
        );

        expect(
            screen.getByLabelText<HTMLInputElement>('Número de transacción')
                .value,
        ).toBe('MP12345678');
    });

    it('hides the transaction number field for cash payments', () => {
        render(
            <EditPaymentModal
                payment={makePayment({
                    type: 'efectivo',
                    transaction_number: null,
                })}
                show
                onClose={vi.fn()}
            />,
        );

        expect(screen.queryByLabelText('Número de transacción')).toBeNull();
    });

    it('puts the changes to payments.update', () => {
        render(
            <EditPaymentModal payment={makePayment()} show onClose={vi.fn()} />,
        );

        fireEvent.click(screen.getByText('Modificar pago'));

        expect(inertia.put).toHaveBeenCalledWith(
            'http://localhost/payments.update/3',
            expect.anything(),
        );
    });

    it('links the duplicate error to the order that already has the number', () => {
        inertia.errors = {
            transaction_number:
                'El número de transacción ya está registrado en el pedido #12.',
        };

        render(
            <EditPaymentModal payment={makePayment()} show onClose={vi.fn()} />,
        );

        const link = screen.getByRole('link', { name: 'pedido #12' });

        expect(link.getAttribute('href')).toBe(
            'http://localhost/orders.show/12',
        );
    });
});
