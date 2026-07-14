import { router } from '@inertiajs/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onFilter } from './filter';

vi.mock('@inertiajs/react', () => ({
    router: { get: vi.fn() },
}));

const get = vi.mocked(router.get);

/** Stub route() so it echoes the current query params of the page. */
function stubQueryParams(params: Record<string, string>) {
    vi.stubGlobal('route', (name?: string) =>
        name === undefined
            ? { queryParams: { ...params } }
            : `http://localhost/${name}`,
    );
}

beforeEach(() => {
    get.mockClear();
});

describe('onFilter', () => {
    it('applies the given filters as query params', () => {
        stubQueryParams({});

        onFilter({ school_id: 7 }, 'orders.index');

        expect(get).toHaveBeenCalledWith('http://localhost/orders.index', {
            school_id: '7',
        });
    });

    it('preserves the other params but leaves the page behind', () => {
        stubQueryParams({
            search: 'carla',
            sort_by: 'id',
            page: '3',
            school_id: '1',
        });

        onFilter({ school_id: 2 }, 'orders.index');

        expect(get).toHaveBeenCalledWith('http://localhost/orders.index', {
            search: 'carla',
            sort_by: 'id',
            school_id: '2',
        });
    });

    it('clears a filter passed as null', () => {
        stubQueryParams({ school_id: '1', classroom_id: '10' });

        onFilter({ school_id: 2, classroom_id: null }, 'orders.index');

        expect(get).toHaveBeenCalledWith('http://localhost/orders.index', {
            school_id: '2',
        });
    });
});
