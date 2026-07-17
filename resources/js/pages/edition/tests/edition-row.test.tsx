import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditionRowData } from '../components/classroom-table';
import { EditionRow } from '../components/edition-row';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn(), delete: vi.fn() },
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const editors = [{ id: 1, name: 'Vale' }];

const makeRow = (overrides: Partial<EditionRowData> = {}): EditionRowData => ({
    id: 1,
    order_id: 10,
    photo_size: 'Foto 15x21',
    diseno: 'Individual',
    child_name: 'Lola',
    photo_number: 12,
    variant_search: 'Individual',
    editing_status: 'pendiente',
    note: 'Nota de fila',
    allowed_targets: [],
    is_first_of_order: true,
    editor: null,
    modelo_cuadro: 'Moldura fina',
    color: 'Negro',
    banda_talle: 'M',
    observaciones_generales: [],
    accessories: {
        carpeta: true,
        banda: false,
        medalla: true,
        taza: false,
        guantes: false,
        escarapela: false,
    },
    ...overrides,
});

function renderRow(row: EditionRowData, canManage: boolean) {
    return render(
        <table>
            <tbody>
                <EditionRow row={row} canManage={canManage} editors={editors} />
            </tbody>
        </table>,
    );
}

describe('EditionRow', () => {
    it('renders the reduced column set for the editor role: no assigned-editor and no accessory columns', () => {
        renderRow(makeRow(), false);

        // banda_talle is present for every role
        expect(screen.getByText('M')).toBeTruthy();
        // Accessory Sí/No cells never render outside canManage
        expect(screen.queryByText('Sí')).toBeNull();
        expect(screen.queryByText('No')).toBeNull();
        // No editor assignment control (Radix combobox trigger)
        expect(screen.queryByRole('combobox')).toBeNull();
    });

    it('renders the full column set for a manager role: accessory flags and assignment control', () => {
        renderRow(makeRow(), true);

        expect(screen.getByText('M')).toBeTruthy();
        expect(screen.getAllByText('Sí')).toHaveLength(2); // carpeta, medalla
        expect(screen.getAllByText('No')).toHaveLength(4); // banda, taza, guantes, escarapela
        expect(screen.getByRole('combobox')).toBeTruthy();
    });

    it('renders order-level cells (modelo cuadro, color, accessories) only on the first row of the order', () => {
        const { container } = renderRow(
            makeRow({ is_first_of_order: false }),
            true,
        );

        const row = within(container).getByRole('row');
        const cells = within(row).getAllByRole('cell');

        // modelo cuadro / color / banda talle cells are blank, not the values
        expect(within(row).queryByText('Moldura fina')).toBeNull();
        expect(within(row).queryByText('Negro')).toBeNull();
        expect(within(row).queryByText('M')).toBeNull();
        // Accessory flags are blank too, not "Sí"/"No"
        expect(within(row).queryByText('Sí')).toBeNull();
        expect(within(row).queryByText('No')).toBeNull();

        expect(cells[4].textContent).toBe(''); // modelo cuadro
        expect(cells[5].textContent).toBe(''); // color
        expect(cells[6].textContent).toBe(''); // banda talle
    });

    it('renders order-level cells on the first row of the order', () => {
        renderRow(makeRow({ is_first_of_order: true }), true);

        expect(screen.getByText('Moldura fina')).toBeTruthy();
        expect(screen.getByText('Negro')).toBeTruthy();
        expect(screen.getByText('M')).toBeTruthy();
    });

    it('Notas cell shows the full note in the tooltip content when opened, not a native title', () => {
        const { container } = renderRow(
            makeRow({ note: 'Nota muy larga de producto' }),
            false,
        );

        // TooltipContent is not mounted until the tooltip opens.
        expect(screen.queryByRole('tooltip')).toBeNull();
        expect(container.querySelector('[title]')).toBeNull();

        fireEvent.focus(screen.getByText('Nota muy larga de producto'));

        // The opened TooltipContent carries the full note text.
        const tooltip = screen.getByRole('tooltip');
        expect(
            within(tooltip).getByText('Nota muy larga de producto'),
        ).toBeTruthy();
        expect(container.querySelector('[title]')).toBeNull();
    });

    it('Notas cell renders blank with no tooltip when the note is empty', () => {
        const { container } = renderRow(makeRow({ note: null }), false);

        const row = within(container).getByRole('row');
        const cells = within(row).getAllByRole('cell');

        // Notas is the cell right before Observaciones generales (last two
        // cells outside canManage: Notas, Observaciones, Estado)
        const notasCell = cells[cells.length - 3];
        expect(notasCell.textContent).toBe('');
        expect(container.querySelector('[title]')).toBeNull();
    });

    it('Observaciones generales shows every note body in the tooltip content when opened, and drops the native title', () => {
        const { container } = renderRow(
            makeRow({
                is_first_of_order: true,
                observaciones_generales: [
                    {
                        id: 1,
                        body: 'Primera observación',
                        created_at: '2026-07-17T10:00:00Z',
                    },
                    {
                        id: 2,
                        body: 'Segunda observación',
                        created_at: '2026-07-17T11:00:00Z',
                    },
                ],
            }),
            false,
        );

        // TooltipContent is not mounted until the tooltip opens.
        expect(screen.queryByRole('tooltip')).toBeNull();
        expect(container.querySelector('[title]')).toBeNull();

        fireEvent.focus(screen.getByRole('list'));

        // The opened TooltipContent carries every note body.
        const tooltip = screen.getByRole('tooltip');
        expect(within(tooltip).getByText('Primera observación')).toBeTruthy();
        expect(within(tooltip).getByText('Segunda observación')).toBeTruthy();
        expect(container.querySelector('[title]')).toBeNull();
    });

    it('Observaciones generales renders — with no tooltip when the order has no notes', () => {
        const { container } = renderRow(
            makeRow({ is_first_of_order: true, observaciones_generales: [] }),
            false,
        );

        expect(screen.getByText('—')).toBeTruthy();
        expect(container.querySelector('[title]')).toBeNull();
    });
});
