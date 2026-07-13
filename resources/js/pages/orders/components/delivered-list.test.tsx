import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeliveredList } from './delivered-list';

const delivered = [
    { order_detail_id: 31, name: 'Mural' },
    { order_detail_id: 32, name: 'Taza' },
] as unknown as Order['products'];

describe('DeliveredList', () => {
    it('lists every delivered product with its badge', () => {
        render(<DeliveredList delivered={delivered} onUndo={vi.fn()} />);

        expect(screen.getByText('Entregados')).toBeTruthy();
        expect(screen.getByText('Mural')).toBeTruthy();
        expect(screen.getByText('Taza')).toBeTruthy();
        expect(screen.getAllByText('Entregado')).toHaveLength(2);
    });

    it('undoes the delivery of a single product', () => {
        const onUndo = vi.fn();

        render(<DeliveredList delivered={delivered} onUndo={onUndo} />);

        fireEvent.click(screen.getAllByTitle('Deshacer entrega')[1]);

        expect(onUndo).toHaveBeenCalledWith(32);
    });
});
