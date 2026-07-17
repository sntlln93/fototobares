import { fireEvent, render, screen } from '@testing-library/react';
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
                canRevert={false}
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
                canRevert={false}
            />,
        );

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: /Editada/ })).toBeTruthy();
    });

    it('renders nothing when there are no allowed targets', () => {
        const { container } = render(
            <TransitionControl
                orderDetailId={3}
                allowedTargets={[]}
                canRevert={false}
            />,
        );

        expect(container.firstChild).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders a Revertir button when canRevert is true, alongside allowed-target buttons', () => {
        render(
            <TransitionControl
                orderDetailId={4}
                allowedTargets={['ok', 'a_corregir']}
                canRevert={true}
            />,
        );

        const buttons = screen.getAllByRole('button');

        expect(buttons).toHaveLength(3);
        expect(screen.getByRole('button', { name: /Revertir/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Ok/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /A corregir/ })).toBeTruthy();
    });

    it('does not render Revertir when canRevert is false', () => {
        render(
            <TransitionControl
                orderDetailId={5}
                allowedTargets={['editada']}
                canRevert={false}
            />,
        );

        expect(screen.queryByRole('button', { name: /Revertir/ })).toBeNull();
    });

    it('renders the control with only the Revertir button when allowedTargets is empty but canRevert is true', () => {
        const { container } = render(
            <TransitionControl
                orderDetailId={6}
                allowedTargets={[]}
                canRevert={true}
            />,
        );

        expect(container.firstChild).not.toBeNull();
        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: /Revertir/ })).toBeTruthy();
    });

    it('calls router.post against editing-status.revert for the given orderDetailId when Revertir is clicked', async () => {
        const { router } = await import('@inertiajs/react');

        render(
            <TransitionControl
                orderDetailId={7}
                allowedTargets={[]}
                canRevert={true}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Revertir/ }));

        expect(router.post).toHaveBeenCalledWith(
            'http://localhost/editing-status.revert',
            {},
            expect.objectContaining({
                preserveScroll: true,
                preserveState: true,
            }),
        );
    });
});
