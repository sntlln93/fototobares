import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from './ui/sidebar';

const usePageMock = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/react', () => ({
    usePage: usePageMock,
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.stubGlobal('route', (name?: string) => `http://localhost/${name ?? ''}`);

const renderSidebarAs = (roles: string[]) => {
    usePageMock.mockReturnValue({
        url: '/dashboard',
        props: {
            auth: {
                user: { id: 1, name: 'Tester', email: 'tester@example.com' },
                roles,
            },
        },
    });

    return render(
        <SidebarProvider>
            <AppSidebar />
        </SidebarProvider>,
    );
};

beforeEach(() => {
    usePageMock.mockReset();
});

describe('AppSidebar', () => {
    it('shows every section to master', () => {
        renderSidebarAs(['master']);

        for (const item of [
            'Dashboard',
            'Combos',
            'Productos',
            'Pedidos',
            'Escuelas',
            'Seguimiento',
            'Stockeables',
            'Reciclaje',
            'Usuarios',
        ]) {
            expect(screen.getByText(item)).toBeTruthy();
        }
    });

    it('hides sales and user management from taller', () => {
        renderSidebarAs(['taller']);

        for (const item of [
            'Dashboard',
            'Seguimiento',
            'Stockeables',
            'Reciclaje',
        ]) {
            expect(screen.getByText(item)).toBeTruthy();
        }

        for (const item of [
            'Pedidos',
            'Escuelas',
            'Combos',
            'Productos',
            'Usuarios',
        ]) {
            expect(screen.queryByText(item)).toBeNull();
        }
    });

    it('shows sales but not user management to administración', () => {
        renderSidebarAs(['administración']);

        expect(screen.getByText('Pedidos')).toBeTruthy();
        expect(screen.queryByText('Usuarios')).toBeNull();
    });

    it('shows only the dashboard to editor', () => {
        renderSidebarAs(['editor']);

        expect(screen.getByText('Dashboard')).toBeTruthy();
        expect(screen.queryByText('Pedidos')).toBeNull();
        expect(screen.queryByText('Seguimiento')).toBeNull();
    });
});
