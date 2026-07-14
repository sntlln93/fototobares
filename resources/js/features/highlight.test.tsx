import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Highlight } from './highlight';

describe('Highlight', () => {
    it('marks the part of the text matching the search term', () => {
        render(<Highlight text="Carla López" term="lopez" />);

        expect(screen.getByText('López').tagName).toBe('MARK');
        expect(screen.getByText('Carla', { exact: false })).toBeDefined();
    });

    it('marks nothing without a term', () => {
        const { container } = render(<Highlight text="Carla López" />);

        expect(container.querySelector('mark')).toBe(null);
        expect(container.textContent).toBe('Carla López');
    });

    it('matches a phone digit by digit when asked to', () => {
        const { container } = render(
            <Highlight text="380 400-0003" term="+54 9 3804000003" phone />,
        );

        expect(container.querySelector('mark')?.textContent).toBe(
            '380 400-0003',
        );
    });

    it('does not treat a phone term as plain text', () => {
        const { container } = render(
            <Highlight text="380 400-0003" term="3804000003" />,
        );

        expect(container.querySelector('mark')).toBe(null);
    });
});
