import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddProduct } from './add-product';

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: {
        photo_types: ['individual', 'grupo'],
        orientations: ['vertical', 'horizontal'],
        backgrounds: ['blue'],
        colors: ['brown'],
        dimentions: '20x30',
    },
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

        fireEvent.click(screen.getByText('Agregar Mural clásico'));

        expect(addProduct).not.toHaveBeenCalled();
        expect(
            screen.getByText('Debes elegir por lo menos una orientación'),
        ).toBeTruthy();
    });

    it('prefills the checkboxes when editing', () => {
        render(
            <AddProduct
                addProduct={vi.fn()}
                product={mural}
                initialVariants={{
                    orientations: ['vertical'],
                    photo_types: ['grupo'],
                    backgrounds: ['blue'],
                    colors: ['brown'],
                    dimentions: '20x30',
                }}
                show
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByText(/Editar Mural clásico/)).toBeTruthy();
        expect(
            screen.getByLabelText<HTMLInputElement>('vertical').checked,
        ).toBe(true);
        expect(
            screen.getByLabelText<HTMLInputElement>('horizontal').checked,
        ).toBe(false);
    });

    it('submits the edited selection keeping quantity for the caller', () => {
        const addProduct = vi.fn();
        const onClose = vi.fn();

        render(
            <AddProduct
                addProduct={addProduct}
                product={mural}
                initialVariants={{
                    orientations: ['vertical'],
                    photo_types: ['grupo'],
                    backgrounds: ['blue'],
                    colors: ['brown'],
                    dimentions: '20x30',
                }}
                show
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByLabelText('horizontal'));
        fireEvent.click(screen.getByText('Agregar Mural clásico'));

        expect(addProduct).toHaveBeenCalledWith({
            id: 1,
            quantity: 1,
            variants: {
                photo_types: ['grupo'],
                orientations: ['vertical', 'horizontal'],
                backgrounds: ['blue'],
                colors: ['brown'],
                dimentions: '20x30',
            },
        });
        expect(onClose).toHaveBeenCalled();
    });
});
