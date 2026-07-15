import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailVariantField } from './detail-variant-field';

const definition: VariantDefinition = {
    label: 'Orientación',
    type: 'text',
    nullable: false,
    options: [{ label: 'Vertical' }, { label: 'Horizontal' }],
};

const renderField = (
    props: Partial<Parameters<typeof DetailVariantField>[0]> = {},
) =>
    render(
        <DetailVariantField
            definition={definition}
            value={null}
            onSelect={vi.fn()}
            {...props}
        />,
    );

describe('DetailVariantField', () => {
    it('renders one option per value', () => {
        renderField();

        expect(screen.getByText('Orientación')).toBeTruthy();
        expect(screen.getByText('Vertical')).toBeTruthy();
        expect(screen.getByText('Horizontal')).toBeTruthy();
    });

    it('notifies the selection with the option label', () => {
        const onSelect = vi.fn();

        renderField({ onSelect });

        fireEvent.click(screen.getByText('Horizontal'));

        expect(onSelect).toHaveBeenCalledWith('Horizontal');
    });

    it('does not offer "definir después" for a non-nullable definition', () => {
        renderField();

        expect(screen.queryByText('Definir después')).toBeNull();
    });

    it('offers "definir después" for a nullable definition and selects null', () => {
        const onSelect = vi.fn();

        render(
            <DetailVariantField
                definition={{ ...definition, nullable: true }}
                value="Vertical"
                onSelect={onSelect}
            />,
        );

        fireEvent.click(screen.getByText('Definir después'));

        expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('shows the validation error only when present', () => {
        const { rerender } = renderField();

        expect(screen.queryByText('Debes elegir una opción')).toBeNull();

        rerender(
            <DetailVariantField
                definition={definition}
                value={null}
                onSelect={vi.fn()}
                error="Debes elegir una opción"
            />,
        );

        expect(screen.getByText('Debes elegir una opción')).toBeTruthy();
    });
});
