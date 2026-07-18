import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
    it('wraps a disabled button in a cursor-not-allowed span', () => {
        render(<Button disabled>Editar</Button>);

        const button = screen.getByRole('button', { name: 'Editar' });
        const wrapper = button.parentElement as HTMLElement;

        expect(wrapper.tagName).toBe('SPAN');
        expect(wrapper.classList.contains('inline-flex')).toBe(true);
        expect(wrapper.classList.contains('cursor-not-allowed')).toBe(true);
        expect(wrapper.contains(button)).toBe(true);
    });

    it('keeps the disabled button non-interactive', () => {
        const onClick = vi.fn();
        render(
            <Button disabled onClick={onClick}>
                Editar
            </Button>,
        );

        const button = screen.getByRole('button', { name: 'Editar' });

        expect(button.hasAttribute('disabled')).toBe(true);
        expect(button.className).toContain('pointer-events-none');

        fireEvent.click(button);

        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not wrap an enabled button and keeps it clickable', () => {
        const onClick = vi.fn();
        const { container } = render(<Button onClick={onClick}>Editar</Button>);

        const button = screen.getByRole('button', { name: 'Editar' });

        expect(container.firstElementChild).toBe(button);
        expect(button.className).not.toContain('cursor-not-allowed');

        fireEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('preserves click-blocking for disabled asChild anchors', () => {
        render(
            <Button asChild disabled>
                <a href="/x">Cancelar</a>
            </Button>,
        );

        const link = screen.getByText('Cancelar');
        const wrapper = link.parentElement as HTMLElement;

        expect(wrapper.tagName).toBe('SPAN');
        expect(wrapper.classList.contains('cursor-not-allowed')).toBe(true);
        expect(link.className).toContain('pointer-events-none');
    });
});
