import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditClientFormController } from '../hooks/use-edit-client-form';
import { EditClientModal } from './edit-client-modal';

const mockSubmit = vi.fn();

const mockForm: EditClientFormController = {
    data: {
        name: 'Original Name',
        phone: '3801234567',
        child_name: 'Original Child',
        attended_photo_session: true,
    },
    setData: vi.fn(),
    errors: {},
    processing: false,
    submit: mockSubmit,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('EditClientModal', () => {
    it('renders the modal when show is true', () => {
        render(<EditClientModal show onClose={vi.fn()} form={mockForm} />);

        expect(screen.getByText('Editar datos del cliente')).toBeTruthy();
    });

    it('does not render when show is false', () => {
        render(
            <EditClientModal show={false} onClose={vi.fn()} form={mockForm} />,
        );

        expect(screen.queryByText('Editar datos del cliente')).toBeNull();
    });

    it('displays form fields with current values', () => {
        render(<EditClientModal show onClose={vi.fn()} form={mockForm} />);

        expect(screen.getByDisplayValue('Original Name')).toBeTruthy();
        expect(screen.getByDisplayValue('3801234567')).toBeTruthy();
        expect(screen.getByDisplayValue('Original Child')).toBeTruthy();
    });

    it('calls setData when form fields change', () => {
        render(<EditClientModal show onClose={vi.fn()} form={mockForm} />);

        const nameInput = screen.getByDisplayValue(
            'Original Name',
        ) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        expect(mockForm.setData).toHaveBeenCalledWith('name', 'New Name');
    });

    it('calls onClose when Cancel is clicked', () => {
        const onClose = vi.fn();

        render(<EditClientModal show onClose={onClose} form={mockForm} />);

        fireEvent.click(screen.getByText('Cancelar'));

        expect(onClose).toHaveBeenCalled();
    });

    it('calls submit and onClose when Save is clicked', () => {
        const onClose = vi.fn();

        render(<EditClientModal show onClose={onClose} form={mockForm} />);

        fireEvent.click(screen.getByText('Guardar cambios'));

        expect(mockSubmit).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('disables submit button while processing', () => {
        const processingForm: EditClientFormController = {
            ...mockForm,
            processing: true,
        };

        render(
            <EditClientModal show onClose={vi.fn()} form={processingForm} />,
        );

        const submitButton = screen
            .getByText('Guardar cambios')
            .closest('button') as HTMLButtonElement;
        expect(submitButton.disabled).toBe(true);
    });

    it('renders radio buttons for attended_photo_session', () => {
        render(<EditClientModal show onClose={vi.fn()} form={mockForm} />);

        expect(screen.getByText('Sí')).toBeTruthy();
        expect(screen.getByText('No')).toBeTruthy();
        expect(screen.getByText('Sin definir')).toBeTruthy();
    });
});
