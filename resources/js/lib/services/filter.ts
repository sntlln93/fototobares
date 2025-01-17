import { router } from '@inertiajs/react';

export function onSearch(searchTerm: string, indexRoute: string) {
    const query = route().queryParams;
    delete query.search;

    if (searchTerm) {
        query.search = searchTerm;
    }

    router.get(route(indexRoute), query);
}

export function onSort<T = string>(sort_by: T, indexRoute: string) {
    const sort_order =
        route().queryParams.sort_order === 'desc' ? 'asc' : 'desc';

    router.get(route(indexRoute), {
        ...route().queryParams,
        sort_order,
        sort_by,
    });
}
