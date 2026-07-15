import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddProduct } from './add-product';

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: [
        {
            label: 'Orientación',
            type: 'text',
            nullable: false,
            options: [{ label: 'Vertical' }, { label: 'Horizontal' }],
        },
        {
            label: 'Color',
            type: 'color',
            nullable: false,
            options: [{ label: 'Negro', color: '#1c1917' }],
        },
    ],
} as unknown as Product;

describe('AddProduct', () => {
    it('does not crash with a product without variants', () => {
        render(
            <AddProduct
                addProduct={vi.fn()}
                product={
                    { ...mural, variants: undefined } as unknown as Product
                }
                show
                onClose={vi.fn()}
            />,
        );

        // The button label matches exactly; the heading includes "al combo"
        expect(screen.getByText('Agregar Mural clásico')).toBeTruthy();
    });

    it('requires at least one option per variant', () => {
        const addProduct = vi.fn();

        render(
            <AddProduct
                addProduct={addProduct}
                product={mural}
                show
                onClose={vi.fn()}
            />,
        );

        // Every option starts selected (unrestricted default); uncheck all
        // of Orientación to leave the definition empty
        fireEvent.click(screen.getByLabelText('Vertical'));
        fireEvent.click(screen.getByLabelText('Horizontal'));

        fireEvent.click(screen.getByText('Agregar Mural clásico'));

        expect(addProduct).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                'Debes elegir por lo menos una opción de "Orientación"',
            ),
        ).toBeTruthy();
    });

    it('prefills the checklist from the existing restriction when editing', () => {
        render(
            <AddProduct
                addProduct={vi.fn()}
                product={mural}
                initialVariants={{ Orientación: ['Vertical'] }}
                show
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText(/Editar Mural clásico/)).toBeTruthy();
        expect(
            screen.getByLabelText<HTMLInputElement>('Vertical').checked,
        ).toBe(true);
        expect(
            screen.getByLabelText<HTMLInputElement>('Horizontal').checked,
        ).toBe(false);
    });

    it('submits the edited selection keeping quantity for the caller', () => {
        const addProduct = vi.fn();
        const onClose = vi.fn();

        render(
            <AddProduct
                addProduct={addProduct}
                product={mural}
                initialVariants={{ Orientación: ['Vertical'] }}
                show
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByLabelText('Horizontal'));
        fireEvent.click(screen.getByText('Agregar Mural clásico'));

        expect(addProduct).toHaveBeenCalledWith({
            id: 1,
            quantity: 1,
            subtract_value: 0,
            variants: {
                Orientación: ['Vertical', 'Horizontal'],
                Color: ['Negro'],
            },
        });
        expect(onClose).toHaveBeenCalled();
    });
});
