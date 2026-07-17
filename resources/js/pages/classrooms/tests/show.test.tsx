import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ClassroomShow from '../show';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({
        href,
        children,
        ...props
    }: {
        href: string;
        children?: ReactNode;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    router: { get: vi.fn() },
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/services/filter', () => ({
    onSearch: vi.fn(),
}));

vi.mock('@/features/editor-assignment/BulkAssignEditorDialog', () => ({
    BulkAssignEditorDialog: () => <button type="button">Asignar editor</button>,
}));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}?${new URLSearchParams(
            Object.entries(params ?? {}).map(([key, value]) => [
                key,
                String(value),
            ]),
        )}`,
);

const classroom = {
    id: 10,
    name: '5 A',
    school_id: 7,
    school: { id: 7, name: 'Escuela Normal' },
} as unknown as Classroom & { teacher?: Teacher; school: School };

const baseProps = {
    classroom,
    students: {
        data: [],
        meta: {
            current_page: 1,
            from: 0,
            last_page: 1,
            links: [],
            path: '',
            per_page: 20,
            to: 0,
            total: 0,
        },
        links: { first: null, last: null, prev: null, next: null },
    },
    filters: { search: null },
    assignableEditors: [],
    photoProducts: [],
} as unknown as Parameters<typeof ClassroomShow>[0];

describe('ClassroomShow', () => {
    it('hides the bulk editor assignment trigger when the scope has no assignable details', () => {
        render(<ClassroomShow {...baseProps} hasAssignableDetails={false} />);

        expect(screen.queryByText('Asignar editor')).toBeNull();
        expect(
            screen.getByRole('link', { name: /Gestionar fotos/ }),
        ).toBeTruthy();
    });

    it('shows the bulk editor assignment trigger when the scope has an assignable detail', () => {
        render(<ClassroomShow {...baseProps} hasAssignableDetails={true} />);

        expect(screen.getByText('Asignar editor')).toBeTruthy();
        expect(
            screen.getByRole('link', { name: /Gestionar fotos/ }),
        ).toBeTruthy();
    });
});
