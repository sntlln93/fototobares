import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
    ClassroomTable,
    EditionClassroom,
} from '../components/classroom-table';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/features/editor-assignment/BulkAssignEditorDialog', () => ({
    BulkAssignEditorDialog: () => <div data-testid="bulk-assign-dialog" />,
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const editors = [{ id: 1, name: 'Vale' }];
const photoProducts = [{ id: 1, name: 'Foto 15x21' }];

const classroom: EditionClassroom = {
    id: 1,
    name: '5 A',
    order_count: 3,
    photoProductGroups: [
        {
            product_id: 1,
            product_name: 'Foto 15x21',
            variant_columns: ['Tipo de foto'],
            rows: [
                {
                    id: 1,
                    order_id: 10,
                    order_seq: 0,
                    photo_size: 'Foto 15x21',
                    variants: { 'Tipo de foto': { label: 'Individual' } },
                    child_name: 'Lola',
                    photo_number: 12,
                    variant_search: 'Individual',
                    editing_status: 'pendiente',
                    note: null,
                    allowed_targets: [],
                    is_first_of_order: true,
                    can_revert: false,
                    editor: null,
                    modelo_cuadro: 'Moldura fina',
                    color: 'Negro',
                    banda_talle: 'M',
                    observaciones_generales: [],
                    accessories: {
                        carpeta: true,
                        banda: false,
                        medalla: false,
                        taza: false,
                        guantes: false,
                        escarapela: false,
                    },
                },
            ],
        },
    ],
    totals: {
        carpeta: 1,
        banda: 0,
        medalla: 0,
        taza: 0,
        guantes: 0,
        escarapela: 0,
    },
};

const MANAGER_ONLY_HEADERS = [
    'Modelo cuadro',
    'Color',
    'Talle banda',
    'Carpeta',
    'Banda',
    'Medalla',
    'Taza',
    'Guantes',
    'Escarapela',
    'Editor asignado',
];

describe('ClassroomTable', () => {
    it('renders the full column set, including totals, for a manager (canManage) view', () => {
        render(
            <ClassroomTable
                classroom={classroom}
                canManage={true}
                editors={editors}
                photoProducts={photoProducts}
            />,
        );

        for (const header of MANAGER_ONLY_HEADERS) {
            expect(screen.getByText(header)).toBeTruthy();
        }
        expect(screen.getByText('Totales')).toBeTruthy();
    });

    it('renders the reduced column set, without totals, for the editor view', () => {
        render(
            <ClassroomTable
                classroom={classroom}
                canManage={false}
                editors={editors}
                photoProducts={photoProducts}
            />,
        );

        for (const header of MANAGER_ONLY_HEADERS) {
            expect(screen.queryByText(header)).toBeNull();
        }
        expect(screen.queryByText('Totales')).toBeNull();
        // Columns common to every role still render
        expect(screen.getByText('Pedido')).toBeTruthy();
        expect(screen.getByText('Tipo de foto')).toBeTruthy();
    });

    it('renders the classroom badge from order_count and the product name as the group heading', () => {
        render(
            <ClassroomTable
                classroom={classroom}
                canManage={true}
                editors={editors}
                photoProducts={photoProducts}
            />,
        );

        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText('Foto 15x21')).toBeTruthy();
    });

    it('renders one sub-table heading per photo-product group', () => {
        const multiGroupClassroom: EditionClassroom = {
            ...classroom,
            photoProductGroups: [
                ...classroom.photoProductGroups,
                {
                    product_id: 2,
                    product_name: 'Foto 10x15',
                    variant_columns: ['Tipo de foto'],
                    rows: [
                        {
                            id: 2,
                            order_id: 11,
                            order_seq: 1,
                            photo_size: 'Foto 10x15',
                            variants: {
                                'Tipo de foto': { label: 'Grupal' },
                            },
                            child_name: 'Nico',
                            photo_number: 13,
                            variant_search: 'Grupal',
                            editing_status: 'pendiente',
                            note: null,
                            allowed_targets: [],
                            is_first_of_order: true,
                            can_revert: false,
                            editor: null,
                            modelo_cuadro: null,
                            color: null,
                            banda_talle: null,
                            observaciones_generales: [],
                            accessories: {
                                carpeta: false,
                                banda: false,
                                medalla: false,
                                taza: false,
                                guantes: false,
                                escarapela: false,
                            },
                        },
                    ],
                },
            ],
        };

        render(
            <ClassroomTable
                classroom={multiGroupClassroom}
                canManage={true}
                editors={editors}
                photoProducts={photoProducts}
            />,
        );

        expect(screen.getByText('Foto 15x21')).toBeTruthy();
        expect(screen.getByText('Foto 10x15')).toBeTruthy();
    });

    it('highlights every row sharing an order_seq across sub-tables on hover, leaving other orders untouched', () => {
        const linkedClassroom: EditionClassroom = {
            ...classroom,
            photoProductGroups: [
                ...classroom.photoProductGroups,
                {
                    product_id: 2,
                    product_name: 'Foto 10x15',
                    variant_columns: ['Tipo de foto'],
                    rows: [
                        {
                            id: 2,
                            order_id: 10,
                            order_seq: 0,
                            photo_size: 'Foto 10x15',
                            variants: {
                                'Tipo de foto': { label: 'Grupal' },
                            },
                            child_name: 'Lola',
                            photo_number: 13,
                            variant_search: 'Grupal',
                            editing_status: 'pendiente',
                            note: null,
                            allowed_targets: [],
                            is_first_of_order: true,
                            can_revert: false,
                            editor: null,
                            modelo_cuadro: null,
                            color: null,
                            banda_talle: null,
                            observaciones_generales: [],
                            accessories: {
                                carpeta: false,
                                banda: false,
                                medalla: false,
                                taza: false,
                                guantes: false,
                                escarapela: false,
                            },
                        },
                        {
                            id: 3,
                            order_id: 11,
                            order_seq: 5,
                            photo_size: 'Foto 10x15',
                            variants: {
                                'Tipo de foto': { label: 'Grupal' },
                            },
                            child_name: 'Nico',
                            photo_number: 14,
                            variant_search: 'Grupal',
                            editing_status: 'pendiente',
                            note: null,
                            allowed_targets: [],
                            is_first_of_order: true,
                            can_revert: false,
                            editor: null,
                            modelo_cuadro: null,
                            color: null,
                            banda_talle: null,
                            observaciones_generales: [],
                            accessories: {
                                carpeta: false,
                                banda: false,
                                medalla: false,
                                taza: false,
                                guantes: false,
                                escarapela: false,
                            },
                        },
                    ],
                },
            ],
        };

        render(
            <ClassroomTable
                classroom={linkedClassroom}
                canManage={true}
                editors={editors}
                photoProducts={photoProducts}
            />,
        );

        const firstGroupRow = screen.getByText('12').closest('tr')!;
        const secondGroupMatchingRow = screen.getByText('13').closest('tr')!;
        const secondGroupOtherRow = screen.getByText('14').closest('tr')!;

        expect(firstGroupRow.className).not.toContain('border-l-blue-400');
        expect(secondGroupMatchingRow.className).not.toContain(
            'border-l-blue-400',
        );

        fireEvent.mouseEnter(firstGroupRow);

        expect(firstGroupRow.className).toContain('border-l-blue-400');
        expect(secondGroupMatchingRow.className).toContain('border-l-blue-400');
        expect(secondGroupOtherRow.className).not.toContain(
            'border-l-blue-400',
        );
    });
});
