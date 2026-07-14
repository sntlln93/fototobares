import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductsTooltip } from './products-tooltip';

const products = [
    {
        order_detail_id: 1,
        name: 'Mural clásico',
        product_type_id: 1,
        priority: true,
        variant: {
            color: '#fff',
            background: 'Bosque',
            photo_type: 'individual',
            orientation: 'vertical',
        },
    },
    {
        order_detail_id: 2,
        name: 'Taza',
        product_type_id: 2,
    },
] as unknown as OrderProduct[];

describe('ProductsTooltip', () => {
    it('lists the order products when the eye button is clicked', () => {
        render(<ProductsTooltip products={products} />);

        expect(screen.queryByText('Mural clásico')).toBeNull();

        fireEvent.click(screen.getByLabelText('Ver productos'));

        expect(screen.getByText('Mural clásico')).toBeTruthy();
        expect(screen.getByText('Taza')).toBeTruthy();
        expect(screen.getByText('Bosque')).toBeTruthy();
    });

    it('badges only the products flagged as priority', () => {
        render(<ProductsTooltip products={products} />);

        fireEvent.click(screen.getByLabelText('Ver productos'));

        expect(screen.getAllByText('Prioridad')).toHaveLength(1);
    });
});
