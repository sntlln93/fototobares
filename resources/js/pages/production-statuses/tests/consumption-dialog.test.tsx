import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConsumptionDialog } from '../components/consumption-dialog';
import { StatusRow, StockableOption } from '../hooks/use-status-actions';

const status: StatusRow = {
    id: 1,
    name: 'Pegado',
    position: 2,
    details_count: 0,
    stockables: [
        { id: 10, name: 'Planchas de MDF', unit: 'Unidad', quantity: -2 },
        { id: 11, name: 'Murales armados', unit: 'Unidad', quantity: 1 },
    ],
};

const stockables: StockableOption[] = [
    { id: 10, name: 'Planchas de MDF', unit: 'Unidad' },
    { id: 11, name: 'Murales armados', unit: 'Unidad' },
    { id: 12, name: 'Bolsas de regalo', unit: 'Unidad' },
];

describe('ConsumptionDialog', () => {
    it('renders signed rows for what the stage moves', () => {
        render(
            <ConsumptionDialog
                status={status}
                stockables={stockables}
                onAttach={vi.fn()}
                onDetach={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText(/-2× Planchas de MDF/)).toBeTruthy();
        expect(screen.getByText(/\+1× Murales armados/)).toBeTruthy();
    });

    it('defaults new movements to "subtract" but attaches "add" when chosen', () => {
        const onAttach = vi.fn();
        render(
            <ConsumptionDialog
                status={status}
                stockables={stockables}
                onAttach={onAttach}
                onDetach={vi.fn()}
                onClose={vi.fn()}
            />,
        );

        const [stockableTrigger, directionTrigger] =
            screen.getAllByRole('combobox');

        expect(directionTrigger.textContent).toContain('Resta del stock');

        fireEvent.keyDown(stockableTrigger, { key: 'Enter' });
        fireEvent.click(
            screen.getByRole('option', { name: /Bolsas de regalo/ }),
        );

        fireEvent.keyDown(directionTrigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Suma al stock' }));

        const form = document.querySelector('form');
        expect(form).not.toBeNull();
        fireEvent.submit(form as HTMLFormElement);

        expect(onAttach).toHaveBeenCalledWith(12, 1, 'add');
    });
});
