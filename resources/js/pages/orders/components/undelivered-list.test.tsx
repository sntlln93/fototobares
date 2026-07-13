import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UndeliveredList } from './undelivered-list';

const undelivered = [
    { order_detail_id: 41, name: 'Mural', production_status: 'Impreso' },
    { order_detail_id: 42, name: 'Taza', production_status: null },
] as unknown as Order['products'];

describe('UndeliveredList', () => {
    it('shows the production stage or a placeholder per product', () => {
        render(
            <UndeliveredList
                undelivered={undelivered}
                selected={[]}
                onToggle={vi.fn()}
                onDeliverSelected={vi.fn()}
            />,
        );

        expect(screen.getByText('Pendientes de entrega')).toBeTruthy();
        expect(screen.getByText('Impreso')).toBeTruthy();
        expect(screen.getByText('Sin empezar')).toBeTruthy();
    });

    it('toggles a product from its checkbox', () => {
        const onToggle = vi.fn();

        render(
            <UndeliveredList
                undelivered={undelivered}
                selected={[]}
                onToggle={onToggle}
                onDeliverSelected={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByLabelText('Taza'));

        expect(onToggle).toHaveBeenCalledWith(42);
    });

    it('blocks bulk delivery while nothing is selected', () => {
        const onDeliverSelected = vi.fn();

        render(
            <UndeliveredList
                undelivered={undelivered}
                selected={[]}
                onToggle={vi.fn()}
                onDeliverSelected={onDeliverSelected}
            />,
        );

        const button = screen.getByText<HTMLButtonElement>(
            'Entregar seleccionados (0)',
        );
        expect(button.disabled).toBe(true);

        fireEvent.click(button);

        expect(onDeliverSelected).not.toHaveBeenCalled();
    });

    it('delivers the current selection', () => {
        const onDeliverSelected = vi.fn();

        render(
            <UndeliveredList
                undelivered={undelivered}
                selected={[41]}
                onToggle={vi.fn()}
                onDeliverSelected={onDeliverSelected}
            />,
        );

        expect(screen.getByLabelText<HTMLInputElement>('Mural').checked).toBe(
            true,
        );
        expect(screen.getByLabelText<HTMLInputElement>('Taza').checked).toBe(
            false,
        );

        fireEvent.click(screen.getByText('Entregar seleccionados (1)'));

        expect(onDeliverSelected).toHaveBeenCalled();
    });
});
