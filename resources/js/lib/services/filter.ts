import { router } from '@inertiajs/react';

export function onSearch(
    searchTerm: string,
    indexRoute: string,
    routeParams?: Record<string, string | number>,
) {
    const query = route().queryParams;
    delete query.search;
    delete query.page;

    if (searchTerm) {
        query.search = searchTerm;
    }

    // The search fires while typing: remounting the page would take the focus
    // away from the input mid-word, so the visit reuses the mounted components.
    router.get(route(indexRoute, routeParams), query, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}

export function onSort(sort_by: string, indexRoute: string) {
    const sort_order =
        route().queryParams.sort_order === 'desc' ? 'asc' : 'desc';

    router.get(route(indexRoute), {
        ...route().queryParams,
        sort_order,
        sort_by,
    });
}
