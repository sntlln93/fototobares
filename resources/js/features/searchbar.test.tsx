import { onSearch } from '@/lib/services/filter';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Searchbar } from './searchbar';

vi.mock('@inertiajs/react', () => ({
    router: { get: vi.fn() },
}));

vi.mock('@/lib/services/filter', () => ({
    onSearch: vi.fn(),
}));

const search = vi.mocked(onSearch);

/** Let the 1s debounce elapse. */
function settle() {
    act(() => {
        vi.advanceTimersByTime(1000);
    });
}

beforeEach(() => {
    vi.useFakeTimers();
    search.mockClear();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('Searchbar', () => {
    it('keeps showing the term already applied', () => {
        render(<Searchbar indexRoute="orders.index" term="3804000003" />);

        expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe(
            '3804000003',
        );

        settle();
        expect(search).not.toHaveBeenCalled();
    });

    it('searches once the typed term settles', () => {
        render(<Searchbar indexRoute="orders.index" />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'lopez' },
        });
        settle();

        expect(search).toHaveBeenCalledWith('lopez', 'orders.index', undefined);
    });

    it('searches a single digit, which is an order number', () => {
        render(<Searchbar indexRoute="orders.index" />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: '7' },
        });
        settle();

        expect(search).toHaveBeenCalledWith('7', 'orders.index', undefined);
    });

    it('clears the filter when the input is emptied', () => {
        render(<Searchbar indexRoute="orders.index" term="lopez" />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: '' },
        });
        settle();

        expect(search).toHaveBeenCalledWith('', 'orders.index', undefined);
    });

    it('carries the route params of pages that are not plain indexes', () => {
        render(
            <Searchbar
                indexRoute="classrooms.show"
                routeParams={{ classroom: 4 }}
            />,
        );

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'lopez' },
        });
        settle();

        expect(search).toHaveBeenCalledWith('lopez', 'classrooms.show', {
            classroom: 4,
        });
    });
});
