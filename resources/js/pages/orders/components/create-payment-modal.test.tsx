import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePaymentModal } from './create-payment-modal';

type FormData = Record<string, unknown>;

const inertia = vi.hoisted(() => ({
    post: vi.fn(),
    errors: {} as Record<string, string>,
    form: null as { setData: (key: string, value: unknown) => void } | null,
}));

vi.mock('@inertiajs/react', async () => {
    const { useState } = await import('react');

    // Stateful stand-in: the transaction number field only appears after
    // setData re-renders with type = transferencia
    function useForm(initial: FormData) {
        const [data, setData] = useState(initial);

        const form = {
            data,
            setData: (
                keyOrUpdater:
                    string | FormData | ((current: FormData) => FormData),
                value?: unknown,
            ) => {
                if (typeof keyOrUpdater === 'string') {
                    setData((prev) => ({ ...prev, [keyOrUpdater]: value }));
                } else {
                    setData(keyOrUpdater);
                }
            },
            post: inertia.post,
            processing: false,
            errors: inertia.errors,
        };

        inertia.form = form;

        return form;
    }

    const Link = ({
        href,
        children,
    }: {
        href: string;
        children?: ReactNode;
    }) => <a href={href}>{children}</a>;

    return { useForm, Link };
});

vi.stubGlobal('route', (name: string, params?: Record<string, unknown>) =>
    params?.order !== undefined
        ? `http://localhost/${name}/${params.order}`
        : `http://localhost/${name}`,
);

const switchToTransfer = () =>
    act(() => inertia.form?.setData('type', 'transferencia'));

beforeEach(() => {
    inertia.post.mockReset();
    inertia.errors = {};
    inertia.form = null;
});

describe('CreatePaymentModal', () => {
    it('prefills the amount when cancelling the balance', () => {
        render(
            <CreatePaymentModal
                orderId={1}
                show
                onClose={vi.fn()}
                initialAmount={7000}
            />,
        );

        expect(screen.getByLabelText<HTMLInputElement>('Monto').value).toBe(
            '7000',
        );
    });

    it('posts the payment to payments.store', () => {
        render(<CreatePaymentModal orderId={1} show onClose={vi.fn()} />);

        fireEvent.click(screen.getByText('Registrar pago'));

        expect(inertia.post).toHaveBeenCalledWith(
            'http://localhost/payments.store',
            expect.anything(),
        );
    });

    it('hides the transaction number field for cash payments', () => {
        render(<CreatePaymentModal orderId={1} show onClose={vi.fn()} />);

        expect(screen.queryByLabelText('Número de transacción')).toBeNull();
    });

    it('asks for the transaction number on transfers', () => {
        render(<CreatePaymentModal orderId={1} show onClose={vi.fn()} />);

        switchToTransfer();

        fireEvent.change(screen.getByLabelText('Número de transacción'), {
            target: { value: 'MP12345678' },
        });

        expect(
            screen.getByLabelText<HTMLInputElement>('Número de transacción')
                .value,
        ).toBe('MP12345678');
    });

    it('links the duplicate error to the order that already has the number', () => {
        inertia.errors = {
            transaction_number:
                'El número de transacción ya está registrado en el pedido #12.',
        };

        render(<CreatePaymentModal orderId={1} show onClose={vi.fn()} />);

        switchToTransfer();

        const link = screen.getByRole('link', { name: 'pedido #12' });

        expect(link.getAttribute('href')).toBe(
            'http://localhost/orders.show/12',
        );
        expect(link.parentElement?.textContent).toBe(
            'El número de transacción ya está registrado en el pedido #12.',
        );
    });
});
