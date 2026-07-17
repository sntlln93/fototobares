import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import School from '../show';

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
    onSort: vi.fn(),
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

const school = {
    data: {
        id: 7,
        name: 'Escuela Normal',
        level: 'Primaria',
        user_id: 1,
        user: { id: 1, name: 'Marta' },
        classrooms: [],
    },
} as unknown as Parameters<typeof School>[0]['school'];

const baseProps = {
    school,
    assignableEditors: [],
    photoProducts: [],
} as unknown as Parameters<typeof School>[0];

describe('School show', () => {
    it('hides the bulk editor assignment trigger when the scope has no assignable details', () => {
        render(<School {...baseProps} hasAssignableDetails={false} />);

        expect(screen.queryByText('Asignar editor')).toBeNull();
    });

    it('shows the bulk editor assignment trigger when the scope has an assignable detail', () => {
        render(<School {...baseProps} hasAssignableDetails={true} />);

        expect(screen.getByText('Asignar editor')).toBeTruthy();
    });
});
