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
                onDisable={() => {}}
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
                onDisable={() => {}}
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
                onDisable={() => {}}
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
                onDisable={() => {}}
            />,
        );

        const trigger = screen.getByRole('combobox');
        expect(trigger.textContent).toContain('Sin empezar');

        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Impreso' }));

        expect(onChange).toHaveBeenCalledWith(21);
    });

    it('asks for confirmation before rolling back to an earlier stage', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Pegado',
                    production_status_id: 22,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={() => {}}
            />,
        );

        const trigger = screen.getByRole('combobox');
        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Impreso' }));

        expect(
            screen.getByText(/¿Estás seguro que querés retroceder/),
        ).toBeTruthy();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('rolls back once the confirmation is accepted', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Pegado',
                    production_status_id: 22,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={() => {}}
            />,
        );

        const trigger = screen.getByRole('combobox');
        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Impreso' }));

        fireEvent.click(screen.getByText('Retroceder'));

        expect(onChange).toHaveBeenCalledWith(21);
    });

    it('keeps the current stage when the rollback is cancelled', () => {
        const onChange = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Pegado',
                    production_status_id: 22,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={() => {}}
            />,
        );

        const trigger = screen.getByRole('combobox');
        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Impreso' }));

        fireEvent.click(screen.getByText('Cancelar'));

        expect(onChange).not.toHaveBeenCalled();
        expect(trigger.textContent).toContain('Pegado');
    });

    it('offers to disable production for an enabled detail', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct()}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        expect(screen.getByText('Deshabilitar fabricación')).toBeTruthy();
    });

    it('does not offer to disable production for a not-enabled detail', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({ production_enabled: false })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        expect(screen.getByText('Habilitar fabricación')).toBeTruthy();
        expect(screen.queryByText('Deshabilitar fabricación')).toBeNull();
    });

    it('disables immediately when the detail has no stage yet', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct()}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        fireEvent.click(screen.getByText('Deshabilitar fabricación'));

        expect(onDisable).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/¿Deshabilitar la fabricación/)).toBeNull();
    });

    it('asks for confirmation before disabling a detail with a reached stage', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Impreso',
                    production_status_id: 21,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        fireEvent.click(screen.getByText('Deshabilitar fabricación'));

        expect(screen.getByText(/¿Deshabilitar la fabricación/)).toBeTruthy();
        expect(onDisable).not.toHaveBeenCalled();
    });

    it('disables the detail once the confirmation is accepted', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Impreso',
                    production_status_id: 21,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        fireEvent.click(screen.getByText('Deshabilitar fabricación'));
        fireEvent.click(screen.getByText('Deshabilitar'));

        expect(onDisable).toHaveBeenCalledTimes(1);
    });

    it('leaves the detail enabled when the disable confirmation is cancelled', () => {
        const onChange = vi.fn();
        const onDisable = vi.fn();
        render(
            <ProductionStatusControl
                product={makeProduct({
                    production_status: 'Impreso',
                    production_status_id: 21,
                })}
                firstInstallmentPaid={true}
                onChange={onChange}
                onDisable={onDisable}
            />,
        );

        fireEvent.click(screen.getByText('Deshabilitar fabricación'));
        fireEvent.click(screen.getByText('Cancelar'));

        expect(onDisable).not.toHaveBeenCalled();
    });
});
