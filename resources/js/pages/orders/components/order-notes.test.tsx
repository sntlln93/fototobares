import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderNotes } from './order-notes';

type FormData = Record<string, unknown>;

const inertia = vi.hoisted(() => ({
    post: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock('@inertiajs/react', async () => {
    const { useState } = await import('react');

    function useForm(initial?: FormData) {
        const [data, setData] = useState(initial ?? {});

        return {
            data,
            setData: (key: string, value: unknown) =>
                setData((prev) => ({ ...prev, [key]: value })),
            post: inertia.post,
            delete: inertia.destroy,
            processing: false,
            errors: {},
            reset: vi.fn(),
        };
    }

    return { useForm };
});

vi.stubGlobal('route', (name: string, params?: Record<string, unknown>) =>
    params?.note !== undefined
        ? `http://localhost/${name}/${params.note}`
        : `http://localhost/${name}`,
);

const order = { id: 1 } as Order;

beforeEach(() => {
    inertia.post.mockReset();
    inertia.destroy.mockReset();
});

describe('OrderNotes', () => {
    it('shows the empty state when there are no notes', () => {
        render(<OrderNotes order={order} notes={[]} />);

        expect(screen.getByText('Sin notas registradas')).toBeTruthy();
    });

    it('lists existing notes', () => {
        render(
            <OrderNotes
                order={order}
                notes={[
                    {
                        id: 1,
                        body: 'Llamar al cliente',
                        created_at: '10/07/2026 12:00',
                    },
                    {
                        id: 2,
                        body: 'Confirmar dirección',
                        created_at: '11/07/2026 09:00',
                    },
                ]}
            />,
        );

        expect(screen.getByText('Llamar al cliente')).toBeTruthy();
        expect(screen.getByText('Confirmar dirección')).toBeTruthy();
    });

    it('disables adding an empty note', () => {
        render(<OrderNotes order={order} notes={[]} />);

        const button = screen
            .getByText('Agregar nota')
            .closest('button') as HTMLButtonElement;

        expect(button.disabled).toBe(true);
    });

    it('posts the note to notes.store', () => {
        render(<OrderNotes order={order} notes={[]} />);

        fireEvent.change(screen.getByPlaceholderText('Escribí una nota...'), {
            target: { value: 'Nueva nota' },
        });

        fireEvent.click(screen.getByText('Agregar nota'));

        expect(inertia.post).toHaveBeenCalledWith(
            'http://localhost/notes.store',
            expect.anything(),
        );
    });

    it('deletes a note after confirming', () => {
        render(
            <OrderNotes
                order={order}
                notes={[
                    {
                        id: 5,
                        body: 'Nota a borrar',
                        created_at: '10/07/2026 12:00',
                    },
                ]}
            />,
        );

        fireEvent.click(screen.getByTitle('Eliminar nota'));

        const dialog = screen.getByRole('alertdialog');

        expect(
            within(dialog).getByText(
                '¿Estás seguro que querés eliminar esta nota?',
            ),
        ).toBeTruthy();

        fireEvent.click(
            within(dialog).getByRole('button', { name: 'Eliminar nota' }),
        );

        expect(inertia.destroy).toHaveBeenCalledWith(
            'http://localhost/notes.destroy/5',
            expect.anything(),
        );
    });
});
