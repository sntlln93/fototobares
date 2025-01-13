import { router } from '@inertiajs/react';

export const onSearch = (searchTerm: string) => {
    const query = route().queryParams;
    delete query.search;

    if (searchTerm) {
        query.search = searchTerm;
    }

    router.get(route('stockables.index'), query);
};

export const onSort = (sort_by: Sort['sort_by']) => {
    const sort_order =
        route().queryParams.sort_order === 'desc' ? 'asc' : 'desc';

    router.get(route('stockables.index'), {
        ...route().queryParams,
        sort_order,
        sort_by,
    });
};
