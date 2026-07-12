import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CancelOrderModal } from './cancel-order-modal';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn() },
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const post = vi.mocked(router.post);

const order = {
    id: 4,
    products: [
        { order_detail_id: 21, name: 'Mural', recycled_to: null },
        { order_detail_id: 22, name: 'Taza', recycled_to: null },
        { order_detail_id: 23, name: 'Medalla', recycled_to: 'stock' },
    ],
} as unknown as Order;

beforeEach(() => {
    post.mockReset();
});

describe('CancelOrderModal', () => {
    it('lists only the products that were not recycled yet', () => {
        render(<CancelOrderModal order={order} show onClose={vi.fn()} />);

        expect(screen.getByText('Mural')).toBeTruthy();
        expect(screen.getByText('Taza')).toBeTruthy();
        expect(screen.queryByText('Medalla')).toBeNull();
    });

    it('defaults every product to recycling when confirming', () => {
        render(<CancelOrderModal order={order} show onClose={vi.fn()} />);

        fireEvent.click(screen.getByText('Confirmar cancelación'));

        expect(post).toHaveBeenCalledWith(
            'http://localhost/orders.cancel/4',
            {
                destinations: [
                    { detail_id: 21, destination: 'reciclaje' },
                    { detail_id: 22, destination: 'reciclaje' },
                ],
            },
            expect.anything(),
        );
    });

    it('does not cancel when going back', () => {
        const onClose = vi.fn();

        render(<CancelOrderModal order={order} show onClose={onClose} />);

        fireEvent.click(screen.getByText('Volver'));

        expect(onClose).toHaveBeenCalled();
        expect(post).not.toHaveBeenCalled();
    });
});
