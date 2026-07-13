import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailVariantField } from './detail-variant-field';

const renderField = (
    props: Partial<Parameters<typeof DetailVariantField>[0]> = {},
) =>
    render(
        <DetailVariantField
            legend="Orientación"
            options={['vertical', 'horizontal']}
            selectedValue={undefined}
            onSelect={vi.fn()}
            renderLabel={(value) => value.toUpperCase()}
            {...props}
        />,
    );

describe('DetailVariantField', () => {
    it('renders one option per value through the label renderer', () => {
        renderField();

        expect(screen.getByText('Orientación')).toBeTruthy();
        expect(screen.getByLabelText('VERTICAL')).toBeTruthy();
        expect(screen.getByLabelText('HORIZONTAL')).toBeTruthy();
    });

    it('marks only the selected option', () => {
        renderField({ selectedValue: 'vertical' });

        expect(
            screen.getByLabelText<HTMLInputElement>('VERTICAL').checked,
        ).toBe(true);
        expect(
            screen.getByLabelText<HTMLInputElement>('HORIZONTAL').checked,
        ).toBe(false);
    });

    it('notifies the selection with the raw option value', () => {
        const onSelect = vi.fn();

        renderField({ onSelect });

        fireEvent.click(screen.getByLabelText('HORIZONTAL'));

        expect(onSelect).toHaveBeenCalledWith('horizontal');
    });

    it('shows the validation error only when present', () => {
        const { rerender } = renderField();

        expect(screen.queryByText('Debes elegir una opción')).toBeNull();

        rerender(
            <DetailVariantField
                legend="Orientación"
                options={['vertical', 'horizontal']}
                onSelect={vi.fn()}
                renderLabel={(value) => value.toUpperCase()}
                error="Debes elegir una opción"
            />,
        );

        expect(screen.getByText('Debes elegir una opción')).toBeTruthy();
    });
});
