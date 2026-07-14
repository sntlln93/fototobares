import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductionStatusControl } from './production-status-control';

const makeProduct = (overrides: Partial<OrderProduct> = {}): OrderProduct =>
    ({
        id: 5,
        order_detail_id: 11,
        name: 'Mural',
        production_enabled: true,
        production_status: null,
        production_status_id: null,
        statuses: [
            { id: 21, name: 'Impreso', position: 1 },
            { id: 22, name: 'Pegado', position: 2 },
        ],
        ...overrides,
    }) as unknown as OrderProduct;

describe('ProductionStatusControl', () => {
    it('explains the gate while the first installment is unpaid', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({ production_enabled: false })}
                firstInstallmentPaid={false}
                onChange={onChange}
            />,
        );

        expect(
            screen.getByText(/se habilita cuando la primera cuota está paga/),
        ).toBeTruthy();
        expect(screen.queryByText('Habilitar fabricación')).toBeNull();
    });

    it('enables production once the first installment is paid', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({ production_enabled: false })}
                firstInstallmentPaid={true}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByText('Habilitar fabricación'));

        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('shows the current stage and moves the detail to another one', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Impreso',
                    production_status_id: 21,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
            />,
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger.textContent).toContain('Impreso');

        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Pegado' }));

        expect(onChange).toHaveBeenCalledWith(22);
    });

    it('offers "Sin empezar" for an enabled detail without a stage', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct()}
                firstInstallmentPaid={true}
                onChange={onChange}
            />,
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger.textContent).toContain('Sin empezar');

        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Impreso' }));

        expect(onChange).toHaveBeenCalledWith(21);
    });
});
