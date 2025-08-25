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
        school_id: number;
    }

    interface Address {
        id: number;
        street?: string;
        number?: string;
        neighborhood?: string;
        city: string;
        full_address: string;
    }

    interface School {
        id: number;
        name: string;
        level: 'Jardín' | 'Primaria' | 'Secundaria';
        user_id: number;
    }

    interface User {
        id: number;
        name: string;
        email: string;
    }

    interface Product {
        id: number;
        name: string;
        unit_price: number;
        financed_price: number;
        max_payments: number;
        product_type_id: number;
        type: ProductType;
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
    type Color = string;

    interface Combo {
        id: number;
        name: string;
        suggested_price: number;
        suggested_max_payments: number;
    }

    interface Order {
        id: number;
        notes: string;
        client_id: number;
        classroom_id: number;
        total_price: number;
        payment_plan: number;
        due_date: string;
        client: Client;
        classroom: Classroom;
        school: School;
        products: Product[];
        payments?: Payment[];
    }

    interface Payment {
        id: number;
        order_id: number;
        amount: number;
        type: string;
        proof_of_payment: string;
        paid_at: string;
    }

    interface Classroom {
        id: number;
        name: string;
    }

    interface School {
        id: number;
        name: string;
    }

    interface Client {
        name: string;
        phone: string;
    }

    interface OrderDetail {
        id: number;
        order_id: number;
        product_id: number;
        notes: string;
        delivered_at?: Date;
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
