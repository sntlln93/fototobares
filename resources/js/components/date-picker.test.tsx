import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
    it('shows the day it was given, not the one before', () => {
        render(<DatePicker date="2026-07-25" setDate={vi.fn()} />);

        expect(screen.getByText('25 de julio de 2026')).toBeTruthy();
    });

    it('falls back to the placeholder when there is no date', () => {
        render(
            <DatePicker date="" placeholder="Sin fecha" setDate={vi.fn()} />,
        );

        expect(screen.getByText('Sin fecha')).toBeTruthy();
    });
});
