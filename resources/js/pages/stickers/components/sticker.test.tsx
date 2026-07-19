import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sticker, type StickerOrder } from './sticker';

const baseOrder: StickerOrder = {
    id: 1,
    order_number: 42,
    child_name: 'Joaquín Pérez',
    school_name: 'Escuela N° 1',
    classroom_name: '3° a',
    photo_url: 'https://example.test/photo.jpg',
    products: [
        {
            name: 'Mural clásico',
            variant: [
                {
                    label: 'Color',
                    type: 'color',
                    value: { label: 'Negro', color: '#1c1917' },
                },
            ],
        },
    ],
};

describe('Sticker', () => {
    it('renders the child, school/classroom, order number and product list', () => {
        render(<Sticker order={baseOrder} />);

        const year = new Date().getFullYear();

        expect(screen.getByText('Joaquín Pérez')).toBeTruthy();
        expect(screen.getByText('Escuela N° 1 (3° a)')).toBeTruthy();
        expect(screen.getByText(`N° 42 · ${year}`)).toBeTruthy();
        expect(screen.getByText('Mural clásico — Negro')).toBeTruthy();
    });

    it('shows placeholders for a missing photo and child name', () => {
        render(
            <Sticker
                order={{ ...baseOrder, photo_url: null, child_name: null }}
            />,
        );

        expect(screen.getByText('Sin foto')).toBeTruthy();
        expect(screen.getByText('Sin nombre')).toBeTruthy();
    });

    it('defaults the photo strip to landscape width', () => {
        render(<Sticker order={baseOrder} />);

        const img = screen.getByAltText('Joaquín Pérez');
        expect(img.parentElement?.className).toContain('w-[45%]');
    });

    it('switches the photo strip to portrait width once the image loads as portrait', () => {
        render(<Sticker order={baseOrder} />);

        const img = screen.getByAltText<HTMLImageElement>('Joaquín Pérez');
        Object.defineProperty(img, 'naturalWidth', {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(img, 'naturalHeight', {
            value: 200,
            configurable: true,
        });
        fireEvent.load(img);

        expect(img.parentElement?.className).toContain('w-[32%]');
    });
});
