import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    Filters,
    SchoolWithClassrooms,
    TrackingFilters,
} from '../components/tracking-filters';

vi.mock('@inertiajs/react', () => ({
    router: { get: vi.fn() },
}));

vi.mock('@/lib/services/filter', () => ({
    onSearch: vi.fn(),
}));

vi.stubGlobal('route', (name?: string) => `http://localhost/${name ?? ''}`);

const schools: SchoolWithClassrooms[] = [
    {
        id: 1,
        name: 'Escuela Normal',
        classrooms: [
            { id: 10, name: '5 A', school_id: 1 },
            { id: 11, name: '5 B', school_id: 1 },
        ],
    },
    {
        id: 2,
        name: 'San José',
        classrooms: [{ id: 20, name: '1 A', school_id: 2 }],
    },
];

const productTypes = [{ id: 1, name: 'mural' }] as ProductType[];

const noFilters: Filters = {
    search: null,
    school_id: null,
    classroom_id: null,
    product_type_id: null,
    production_status_id: null,
};

const onApply = vi.fn();

function renderFilters(filters: Partial<Filters> = {}) {
    return render(
        <TrackingFilters
            filters={{ ...noFilters, ...filters }}
            schools={schools}
            productTypes={productTypes}
            onApply={onApply}
        />,
    );
}

function openSelect(currentValue: string) {
    fireEvent.keyDown(screen.getByText(currentValue), { key: 'Enter' });
}

beforeEach(() => {
    onApply.mockClear();
});

describe('TrackingFilters', () => {
    it('derives the school from a classroom-only filter', () => {
        renderFilters({ classroom_id: 10 });

        expect(screen.getByText('Escuela Normal')).toBeTruthy();
        expect(screen.getByText('5 A')).toBeTruthy();
    });

    it('drops the classroom filter when the school changes', () => {
        renderFilters({ school_id: 1, classroom_id: 10 });

        openSelect('Escuela Normal');
        fireEvent.click(screen.getByRole('option', { name: 'San José' }));

        expect(onApply).toHaveBeenCalledWith({
            school_id: 2,
            classroom_id: null,
        });
    });

    it('scopes the classroom list to the filtered school', () => {
        renderFilters({ school_id: 1 });

        openSelect('Todos los cursos');

        expect(screen.getByRole('option', { name: '5 A' })).toBeTruthy();
        expect(screen.getByRole('option', { name: '5 B' })).toBeTruthy();
        expect(screen.queryByRole('option', { name: /1 A/ })).toBeNull();
    });

    it('prefixes classrooms with their school when no school is filtered', () => {
        renderFilters();

        openSelect('Todos los cursos');

        expect(
            screen.getByRole('option', { name: 'Escuela Normal — 5 A' }),
        ).toBeTruthy();
        expect(
            screen.getByRole('option', { name: 'San José — 1 A' }),
        ).toBeTruthy();
    });

    it('applies the classroom filter', () => {
        renderFilters({ school_id: 1 });

        openSelect('Todos los cursos');
        fireEvent.click(screen.getByRole('option', { name: '5 B' }));

        expect(onApply).toHaveBeenCalledWith({
            classroom_id: 11,
        });
    });
});
