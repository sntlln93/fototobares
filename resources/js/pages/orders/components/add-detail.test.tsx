import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelectableProduct } from '../form';
import { AddDetail } from './add-detail';

const muralVariants: VariantDefinition[] = [
    {
        label: 'Orientación',
        type: 'text',
        nullable: false,
        options: [{ label: 'Vertical' }, { label: 'Horizontal' }],
    },
    {
        label: 'Tipo de foto',
        type: 'text',
        nullable: false,
        options: [{ label: 'Individual' }, { label: 'Grupo' }],
    },
    {
        label: 'Fondo',
        type: 'color',
        nullable: false,
        options: [{ label: 'Celeste', color: '#93c5fd' }],
    },
    {
        label: 'Color',
        type: 'color',
        nullable: false,
        options: [{ label: 'Marrón', color: '#78350f' }],
    },
];

const mural = {
    id: 1,
    product_type_id: 1,
    name: 'Mural clásico',
    variants: muralVariants,
} as unknown as SelectableProduct;

const taza = {
    id: 2,
    product_type_id: 2,
    name: 'Taza',
} as SelectableProduct;

describe('AddDetail', () => {
    it('blocks adding a mural without its required variants', () => {
        const addProducts = vi.fn();

        render(
            <AddDetail
                addProducts={addProducts}
                products={[mural]}
                show
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByText('Agregar 1 producto al pedido'));

        expect(addProducts).not.toHaveBeenCalled();
        expect(screen.getAllByText('Debes elegir una opción')).toHaveLength(
            muralVariants.length,
        );
        expect(
            screen.getByText(
                'Este campo es requerido cuando el producto es un mural',
            ),
        ).toBeTruthy();
    });

    it('adds a non-mural product with just a note', () => {
        const addProducts = vi.fn();
        const onClose = vi.fn();

        render(
            <AddDetail
                addProducts={addProducts}
                products={[taza]}
                show
                onClose={onClose}
            />,
        );

        fireEvent.change(screen.getByLabelText('Notas'), {
            target: { value: 'Taza de Pedro' },
        });
        fireEvent.click(screen.getByText('Agregar 1 producto al pedido'));

        expect(addProducts).toHaveBeenCalledWith([
            {
                combo_id: undefined,
                product_id: 2,
                variant: undefined,
                note: 'Taza de Pedro',
            },
        ]);
        expect(onClose).toHaveBeenCalled();
    });

    it('prefills the form when editing an added product', () => {
        render(
            <AddDetail
                addProducts={vi.fn()}
                products={[taza]}
                initialValues={[{ product_id: 2, note: 'Taza de Luca' }]}
                show
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByLabelText<HTMLInputElement>('Notas').value).toBe(
            'Taza de Luca',
        );
    });
});
