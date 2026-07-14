import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
    type SchoolShowController,
    type SchoolShowData,
} from '../hooks/use-school-show';
import { ClassroomsTable } from './classrooms-table';

vi.mock('@inertiajs/react', () => ({
    router: { get: vi.fn() },
    Link: ({
        href,
        children,
        ...props
    }: {
        href: string;
        children: React.ReactNode;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('@/lib/services/filter', () => ({
    onSearch: vi.fn(),
    onSort: vi.fn(),
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, string | number>) =>
        `http://localhost/${name}?${new URLSearchParams(
            Object.entries(params ?? {}).map(([key, value]) => [
                key,
                String(value),
            ]),
        )}`,
);

const school = {
    id: 7,
    name: 'Escuela Normal',
    classrooms: [
        { id: 10, name: '5 A', teacher: { name: 'Marta' } },
        { id: 11, name: '5 B', teacher: { name: 'Jorge' } },
    ],
} as unknown as SchoolShowData;

const controller = {
    setShowAddClassroom: vi.fn(),
    setEditableClassroom: vi.fn(),
    setDeleteableClassroom: vi.fn(),
} as unknown as SchoolShowController;

describe('ClassroomsTable', () => {
    it('links each classroom to its filtered orders', () => {
        render(<ClassroomsTable school={school} controller={controller} />);

        const links = screen
            .getAllByLabelText<HTMLAnchorElement>('Ver pedidos')
            .map((el) => el.href);

        expect(links).toEqual([
            'http://localhost/orders.index?classroom_id=10',
            'http://localhost/orders.index?classroom_id=11',
        ]);
    });
});
