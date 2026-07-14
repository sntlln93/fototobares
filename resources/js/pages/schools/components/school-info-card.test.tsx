import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type SchoolShowData } from '../hooks/use-school-show';
import { SchoolInfoCard } from './school-info-card';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
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
    level: 'Primaria',
    user: { id: 1, name: 'Vendedor', email: 'v@example.com' },
    classrooms: [],
    full_address: 'Av. Siempreviva 742',
} as unknown as SchoolShowData;

describe('SchoolInfoCard', () => {
    it('links to the orders filtered by the school', () => {
        render(<SchoolInfoCard school={school} />);

        const link = screen
            .getByText('Ver pedidos')
            .closest('a') as HTMLAnchorElement;

        expect(link.href).toBe('http://localhost/orders.index?school_id=7');
    });
});
