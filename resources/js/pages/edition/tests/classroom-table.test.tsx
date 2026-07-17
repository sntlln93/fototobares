import { render, screen } from '@testing-library/react';
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
});
