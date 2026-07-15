import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditVariantFormController } from '../hooks/use-edit-variant-form';
import { EditVariantModal } from './edit-variant-modal';

const mockSubmit = vi.fn();

const product = {
    id: 5,
    order_detail_id: 11,
    name: 'Banda',
    variants: [
        {
            label: 'Talle',
            type: 'text',
            nullable: true,
            options: [{ label: 'Único' }, { label: 'M' }],
        },
    ],
} as unknown as OrderProduct;

const mockForm: EditVariantFormController = {
    data: { detail_id: 11, variant: { Talle: 'M' } },
    setData: vi.fn(),
    errors: {},
    processing: false,
    submit: mockSubmit,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('EditVariantModal', () => {
    it('renders the modal when show is true', () => {
        render(
            <EditVariantModal
                show
                onClose={vi.fn()}
                product={product}
                form={mockForm}
            />,
        );

        expect(screen.getByText('Editar variantes de Banda')).toBeTruthy();
    });

    it('does not render when show is false', () => {
        render(
            <EditVariantModal
                show={false}
                onClose={vi.fn()}
                product={product}
                form={mockForm}
            />,
        );

        expect(screen.queryByText('Editar variantes de Banda')).toBeNull();
    });

    it('shows the current selection', () => {
        render(
            <EditVariantModal
                show
                onClose={vi.fn()}
                product={product}
                form={mockForm}
            />,
        );

        expect(screen.getByRole('combobox').textContent).toContain('M');
    });

    it('sets null when "Definir después" is selected', () => {
        render(
            <EditVariantModal
                show
                onClose={vi.fn()}
                product={product}
                form={mockForm}
            />,
        );

        const trigger = screen.getByRole('combobox');
        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(
            screen.getByRole('option', { name: 'Definir después' }),
        );

        expect(mockForm.setData).toHaveBeenCalledWith('variant', {
            Talle: null,
        });
    });

    it('sets the option label when a value is picked', () => {
        render(
            <EditVariantModal
                show
                onClose={vi.fn()}
                product={product}
                form={mockForm}
            />,
        );

        const trigger = screen.getByRole('combobox');
        fireEvent.keyDown(trigger, { key: 'Enter' });
        fireEvent.click(screen.getByRole('option', { name: 'Único' }));

        expect(mockForm.setData).toHaveBeenCalledWith('variant', {
            Talle: 'Único',
        });
    });

    it('calls onClose when Cancel is clicked', () => {
        const onClose = vi.fn();

        render(
            <EditVariantModal
                show
                onClose={onClose}
                product={product}
                form={mockForm}
            />,
        );

        fireEvent.click(screen.getByText('Cancelar'));

        expect(onClose).toHaveBeenCalled();
    });

    it('calls submit and onClose when Save is clicked', () => {
        const onClose = vi.fn();

        render(
            <EditVariantModal
                show
                onClose={onClose}
                product={product}
                form={mockForm}
            />,
        );

        fireEvent.click(screen.getByText('Guardar cambios'));

        expect(mockSubmit).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
