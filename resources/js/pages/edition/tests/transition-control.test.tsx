import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransitionControl } from '../components/transition-control';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn() },
}));

vi.stubGlobal('route', (name: string) => `http://localhost/${name}`);

describe('TransitionControl', () => {
    it('renders exactly the allowed target statuses and nothing else', () => {
        render(
            <TransitionControl
                orderDetailId={1}
                allowedTargets={['ok', 'a_corregir']}
            />,
        );

        const buttons = screen.getAllByRole('button');

        expect(buttons).toHaveLength(2);
        expect(screen.getByRole('button', { name: /Ok/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /A corregir/ })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Editada/ })).toBeNull();
        expect(screen.queryByRole('button', { name: /Pendiente/ })).toBeNull();
    });

    it('renders a single button for a single allowed target', () => {
        render(
            <TransitionControl
                orderDetailId={2}
                allowedTargets={['editada']}
            />,
        );

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: /Editada/ })).toBeTruthy();
    });

    it('renders nothing when there are no allowed targets', () => {
        const { container } = render(
            <TransitionControl orderDetailId={3} allowedTargets={[]} />,
        );

        expect(container.firstChild).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
