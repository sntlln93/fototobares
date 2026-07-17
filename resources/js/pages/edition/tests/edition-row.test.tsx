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
const variantColumns = ['Tipo de foto'];

const makeRow = (overrides: Partial<EditionRowData> = {}): EditionRowData => ({
    id: 1,
    order_id: 10,
    order_seq: 0,
    photo_size: 'Foto 15x21',
    variants: { 'Tipo de foto': { label: 'Individual' } },
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

function renderRow(
    row: EditionRowData,
    canManage: boolean,
    options: {
        isHighlighted?: boolean;
        onHoverChange?: (orderSeq: number | null) => void;
    } = {},
) {
    const { isHighlighted = false, onHoverChange = () => {} } = options;

    return render(
        <table>
            <tbody>
                <EditionRow
                    row={row}
                    variantColumns={variantColumns}
                    canManage={canManage}
                    editors={editors}
                    isHighlighted={isHighlighted}
                    onHoverChange={onHoverChange}
                />
            </tbody>
        </table>,
    );
}

describe('EditionRow', () => {
    it('renders one cell per variant_columns label, from the variants map', () => {
        renderRow(makeRow(), false);

        expect(screen.getByText('Individual')).toBeTruthy();
    });

    it('renders the reduced column set for the editor role: no non-photo columns and no assigned-editor', () => {
        renderRow(makeRow(), false);

        // modelo cuadro / color / banda talle are manager-only now
        expect(screen.queryByText('Moldura fina')).toBeNull();
        expect(screen.queryByText('Negro')).toBeNull();
        expect(screen.queryByText('M')).toBeNull();
        // Accessory Sí/No cells never render outside canManage
        expect(screen.queryByText('Sí')).toBeNull();
        expect(screen.queryByText('No')).toBeNull();
        // No editor assignment control (Radix combobox trigger)
        expect(screen.queryByRole('combobox')).toBeNull();
    });

    it('renders the full column set for a manager role: non-photo columns, accessory flags and assignment control', () => {
        renderRow(makeRow(), true);

        expect(screen.getByText('Moldura fina')).toBeTruthy();
        expect(screen.getByText('Negro')).toBeTruthy();
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

        // Cells: 0 Pedido, 1 Niño, 2 Tipo de foto (variant), 3 modelo cuadro,
        // 4 color, 5 banda talle, 6-11 accessories, 12 Notas, 13
        // Observaciones, 14 Estado, 15 Editor asignado
        expect(cells[3].textContent).toBe(''); // modelo cuadro
        expect(cells[4].textContent).toBe(''); // color
        expect(cells[5].textContent).toBe(''); // banda talle
    });

    it('renders order-level cells on the first row of the order', () => {
        renderRow(makeRow({ is_first_of_order: true }), true);

        expect(screen.getByText('Moldura fina')).toBeTruthy();
        expect(screen.getByText('Negro')).toBeTruthy();
        expect(screen.getByText('M')).toBeTruthy();
    });

    it('renders the Pedido cell from photo_number, linking to the order', () => {
        render(
            <table>
                <tbody>
                    <EditionRow
                        row={makeRow({ photo_number: 99, order_id: 55 })}
                        variantColumns={variantColumns}
                        canManage={false}
                        editors={editors}
                        isHighlighted={false}
                        onHoverChange={() => {}}
                    />
                </tbody>
            </table>,
        );

        const link = screen.getByText('99');
        expect(link.closest('a')?.getAttribute('href')).toBe(
            'http://localhost/orders.show/55',
        );
    });

    it('renders — in the Pedido cell when photo_number is null', () => {
        const { container } = renderRow(makeRow({ photo_number: null }), false);

        const row = within(container).getByRole('row');
        const cells = within(row).getAllByRole('cell');

        expect(cells[0].textContent).toBe('—');
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

    it('renders no order-grouping mark by default (no hover)', () => {
        const { container } = renderRow(makeRow({ order_seq: 3 }), false);

        const row = within(container).getByRole('row');
        expect(row.className).not.toContain('border-l-blue-400');
        expect(row.className).not.toContain('bg-blue-50');
    });

    it('calls onHoverChange with the order_seq on mouse enter, and null on mouse leave', () => {
        const onHoverChange = vi.fn();
        const { container } = renderRow(makeRow({ order_seq: 4 }), false, {
            onHoverChange,
        });

        const row = within(container).getByRole('row');

        fireEvent.mouseEnter(row);
        expect(onHoverChange).toHaveBeenCalledWith(4);

        fireEvent.mouseLeave(row);
        expect(onHoverChange).toHaveBeenCalledWith(null);
    });

    it('carries the highlight classes when isHighlighted is true, and not when false', () => {
        const { container: highlighted } = renderRow(makeRow(), false, {
            isHighlighted: true,
        });
        const { container: notHighlighted } = renderRow(makeRow(), false, {
            isHighlighted: false,
        });

        const highlightedRow = within(highlighted).getByRole('row');
        const notHighlightedRow = within(notHighlighted).getByRole('row');

        expect(highlightedRow.className).toContain('border-l-blue-400');
        expect(notHighlightedRow.className).not.toContain('border-l-blue-400');
    });
});
