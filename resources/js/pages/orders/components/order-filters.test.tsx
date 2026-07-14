import { onFilter } from '@/lib/services/filter';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    OrderFilters,
    OrderIndexFilters,
    SchoolWithClassrooms,
} from './order-filters';

vi.mock('@inertiajs/react', () => ({
    router: { get: vi.fn() },
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@/lib/services/filter', () => ({
    onSearch: vi.fn(),
    onFilter: vi.fn(),
}));

vi.stubGlobal('route', (name?: string) => `http://localhost/${name ?? ''}`);

const filter = vi.mocked(onFilter);

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
] as SchoolWithClassrooms[];

const noFilters: OrderIndexFilters = {
    search: null,
    school_id: null,
    classroom_id: null,
};

function renderFilters(filters: Partial<OrderIndexFilters> = {}) {
    return render(
        <OrderFilters
            schools={schools}
            filters={{ ...noFilters, ...filters }}
        />,
    );
}

beforeEach(() => {
    filter.mockClear();
});

describe('OrderFilters', () => {
    it('shows the placeholders when no filter is applied', () => {
        renderFilters();

        expect(screen.getByText('Filtrar por escuela')).toBeTruthy();
        expect(screen.getByText('Filtrar por curso')).toBeTruthy();
    });

    it('shows the filtered school name', () => {
        renderFilters({ school_id: 2 });

        expect(screen.getByText('San José')).toBeTruthy();
        expect(screen.getByText('Filtrar por curso')).toBeTruthy();
    });

    it('derives the school from a classroom-only filter', () => {
        renderFilters({ classroom_id: 10 });

        expect(screen.getByText('Escuela Normal')).toBeTruthy();
        expect(screen.getByText('5 A')).toBeTruthy();
    });

    it('drops the classroom filter when a school is picked', () => {
        renderFilters({ classroom_id: 10 });

        fireEvent.click(screen.getByText('Escuela Normal'));
        fireEvent.click(screen.getByText('San José'));

        expect(filter).toHaveBeenCalledWith(
            { school_id: '2', classroom_id: null },
            'orders.index',
        );
    });

    it('scopes the classroom list to the filtered school', () => {
        renderFilters({ school_id: 1 });

        fireEvent.click(screen.getByText('Filtrar por curso'));

        expect(screen.getByText('5 A')).toBeTruthy();
        expect(screen.getByText('5 B')).toBeTruthy();
        expect(screen.queryByText(/1 A/)).toBeNull();
    });

    it('prefixes classrooms with their school when no school is filtered', () => {
        renderFilters();

        fireEvent.click(screen.getByText('Filtrar por curso'));

        expect(screen.getByText('Escuela Normal — 5 A')).toBeTruthy();
        expect(screen.getByText('San José — 1 A')).toBeTruthy();
    });

    it('keeps the school filter when a classroom is picked', () => {
        renderFilters({ school_id: 1 });

        fireEvent.click(screen.getByText('Filtrar por curso'));
        fireEvent.click(screen.getByText('5 B'));

        expect(filter).toHaveBeenCalledWith(
            { classroom_id: '11' },
            'orders.index',
        );
    });
});
