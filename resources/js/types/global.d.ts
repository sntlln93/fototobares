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
        teacher?: Teacher;
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
        level: 'Jardín' | 'Primaria' | 'Secundaria';
        classrooms: Classroom[];
        full_address: string;
        address: Address;
        user_id: number;
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
        unit_price: number;
        max_payments: number;
        product_type_id: number;
        variants: {
            photo_types: ProductPhotoType[];
            orientations: ProductOrientation[];
            backgrounds: string[];
            colors: Color[];
            dimentions: string;
        };
    }

    interface ProductType {
        id: number;
        name: string;
    }

    type ProductPhotoType = 'grupo' | 'individual';
    type ProductOrientation = 'vertical' | 'horizontal';
    type Color = 'black' | 'white' | 'pink' | 'blue';

    interface Combo {
        id: number;
        name: string;
        suggested_price: number;
        suggested_max_payments: number;
        products: Product[];
    }

    interface Order {
        id: number;
        notes: string;
        client_id: string;
        classroom: Classroom;
        details: OrderDetail[];
    }

    interface OrderDetail {
        id: number;
        order_id: number;
        product: Product;
        notes: string;
        variant: {
            photo_type: ProductPhotoType;
            orientation: ProductOrientation;
            background: string;
            color: string;
            dimentions: string;
        };
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
