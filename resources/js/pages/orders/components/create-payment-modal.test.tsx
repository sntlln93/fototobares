import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePaymentModal } from './create-payment-modal';

const post = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/react', () => ({
    useForm: (initial: Record<string, unknown>) => ({
        data: initial,
        setData: vi.fn(),
        post,
        processing: false,
        errors: {},
    }),
}));

vi.stubGlobal('route', (name: string) => `http://localhost/${name}`);

beforeEach(() => {
    post.mockReset();
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

    it('submits as multipart to support the optional proof file', () => {
        render(<CreatePaymentModal orderId={1} show onClose={vi.fn()} />);

        fireEvent.click(screen.getByText('Registrar pago'));

        expect(post).toHaveBeenCalledWith(
            'http://localhost/payments.store',
            expect.objectContaining({ forceFormData: true }),
        );
    });
});
