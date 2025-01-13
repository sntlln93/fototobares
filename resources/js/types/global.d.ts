import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;

    /* api */
    type Sort = {
        sort_by: 'id' | 'name' | 'quantity';
        sort_order: 'asc' | 'desc';
    };

    type PageProps<
        T extends Record<string, unknown> = Record<string, unknown>,
    > = T & {
        auth: {
            user: User;
        };
    };

    type Paginated<T> = {
        [k: string]: {
            current_page: number;
            data: T[];
            first_page_url: string;
            from: number;
            last_page: number;
            last_page_url: string;
            links: PaginatedLink[];
            next_page_url: string | null;
            path: string;
            per_page: number;
            prev_page_url: string | null;
            to: number;
            total: number;
        };
    };

    type PaginatedLink = {
        url: string | undefined;
        label: string;
        active: boolean;
    };

    /* entities */
    type Stockable = {
        id: number;
        name: string;
        quantity: number;
        products: Product[];
        unit: string;
        alert_at: number;
    };

    interface User {
        id: number;
        name: string;
        email: string;
        email_verified_at?: string;
    }

    type Product = {
        id: number;
        name: string;
    };
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
