import { ContactRole } from '@/lib/enums';
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
    type PageProps<
        T extends Record<string, unknown> = Record<string, unknown>,
    > = T & {
        auth: {
            user: User;
        };
    };

    interface Paginated<T> {
        [k: string]: {
            data: T[];
            meta: {
                current_page: number;
                from: number;
                last_page: number;
                links: PaginatedLink[];
                path: string;
                per_page: number;
                to: number;
                total: number;
            };
            links: {
                first_page_url: string;
                last_page_url: string;
                next_page_url: string | null;
                prev_page_url: string | null;
            };
        };
    }

    interface PaginatedLink {
        url: string | undefined;
        label: string;
        active: boolean;
    }

    /* entities */
    interface Stockable {
        id: number;
        name: string;
        quantity: number;
        products: Product[];
        unit: string;
        alert_at: number;
    }

    interface Contact {
        id: number;
        name: string;
        phone: string;
        role: ContactRole;
    }

    interface Principal extends Contact {}
    interface Teacher extends Contact {}

    interface Classroom {
        id: number;
        name: string;
        teacher: Teacher;
    }

    interface Address {
        id: number;
        street?: string;
        number?: string;
        neighborhood?: string;
        city: string;
    }

    interface School {
        id: number;
        name: string;
        principal: Principal;
        classrooms: Omit<Classroom, 'teacher'>[];
        full_address: string;
        address: Address;
    }

    interface User {
        id: number;
        name: string;
        email: string;
        email_verified_at?: string;
    }

    interface Product {
        id: number;
        name: string;
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
