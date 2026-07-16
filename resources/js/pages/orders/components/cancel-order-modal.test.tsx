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
        {
            order_detail_id: 21,
            name: 'Mural',
            recycled_to: null,
            has_returnable_stock: false,
        },
        {
            order_detail_id: 22,
            name: 'Taza',
            recycled_to: null,
            has_returnable_stock: true,
        },
        {
            order_detail_id: 23,
            name: 'Medalla',
            recycled_to: 'stock',
            has_returnable_stock: true,
        },
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

    it('disables the stock destination when the product has nothing to return', () => {
        render(<CancelOrderModal order={order} show onClose={vi.fn()} />);

        // Check that the hint is present for the product without returnable stock (Mural)
        expect(
            screen.getByText('Sin insumos para devolver a stock'),
        ).toBeTruthy();

        // Open the select for Mural (first product) using combobox role
        const selectTriggers = screen.getAllByRole('combobox');
        fireEvent.click(selectTriggers[0]);

        // The Stock option should be disabled
        const stockOption = screen.getByRole('option', { name: 'Stock' });
        expect(stockOption.getAttribute('aria-disabled')).toBe('true');
    });

    it('allows the stock destination when the product has returnable supplies', () => {
        render(<CancelOrderModal order={order} show onClose={vi.fn()} />);

        // Get all product rows and find Taza (second product with has_returnable_stock: true)
        // The hint should only appear once (for Mural)
        const hints = screen.queryAllByText(
            'Sin insumos para devolver a stock',
        );
        expect(hints.length).toBe(1);

        // Open the select for Taza (second product) - it should be selectable to Stock
        const selectTriggers = screen.getAllByRole('combobox');
        fireEvent.click(selectTriggers[1]);

        // The Stock option should not be disabled for this product
        const stockOption = screen.getByRole('option', { name: 'Stock' });
        expect(stockOption.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('explains each destination distinctly', () => {
        render(<CancelOrderModal order={order} show onClose={vi.fn()} />);

        // Check for text describing the "Reciclaje" destination
        expect(screen.getByText(/módulo de reciclaje/i)).toBeTruthy();

        // Check for text describing the "Stock" destination
        expect(screen.getByText(/inventario.*insumos/i)).toBeTruthy();
    });
});
