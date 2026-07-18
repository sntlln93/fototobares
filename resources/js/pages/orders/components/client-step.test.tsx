import { Accordion } from '@/components/ui/accordion';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { emptyForm } from '../form-state';
import { OrderFormController } from '../hooks/use-create-order-form';
import { ClientStep } from './client-step';

const makeForm = (
    overrides: Partial<OrderFormController> = {},
): OrderFormController =>
    ({
        data: { ...emptyForm(), attended_photo_session: true },
        setData: vi.fn(),
        errors: {},
        errorFlags: {},
        toStep: () => vi.fn(),
        ...overrides,
    }) as unknown as OrderFormController;

const renderClientStep = (form: OrderFormController) =>
    render(
        <Accordion type="single" collapsible defaultValue="client">
            <ClientStep form={form} />
        </Accordion>,
    );

describe('ClientStep', () => {
    it('renders the three attendance options', () => {
        renderClientStep(makeForm());

        expect(screen.getByLabelText('Sí')).toBeTruthy();
        expect(screen.getByLabelText('No')).toBeTruthy();
        expect(screen.getByLabelText('Sin especificar')).toBeTruthy();
    });

    it('checks "Sin especificar" when attendance is null', () => {
        const form = makeForm({
            data: { ...emptyForm(), attended_photo_session: null },
        });

        renderClientStep(form);

        expect(
            (screen.getByLabelText('Sin especificar') as HTMLInputElement)
                .checked,
        ).toBe(true);
        expect((screen.getByLabelText('Sí') as HTMLInputElement).checked).toBe(
            false,
        );
        expect((screen.getByLabelText('No') as HTMLInputElement).checked).toBe(
            false,
        );
    });

    it('calls setData with null when clicking "Sin especificar"', async () => {
        const setData = vi.fn();
        const form = makeForm({ setData });

        renderClientStep(form);

        screen.getByLabelText('Sin especificar').click();

        expect(setData).toHaveBeenCalledWith('attended_photo_session', null);
    });
});
