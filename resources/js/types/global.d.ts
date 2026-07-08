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
            roles: string[];
        };
    };

    interface Paginated<T> {
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
        /** Nullable in the database: murals without variants exist */
        variants?: {
            photo_types: ProductPhotoType[];
            orientations: ProductOrientation[];
            backgrounds: string[];
            colors: Color[];
            dimentions: string;
        } | null;
    }

    interface OrderProduct extends Product {
        product_id: number;
        order_detail_id: number;
        note?: string | null;
        variant?: Record<string, string>;
        delivered_at?: string | null;
        production_status?: string | null;
        production_status_id?: number | null;
        priority?: boolean | null;
        recycled_to?: 'stock' | 'reciclaje' | null;
    }

    interface ProductionStatus {
        id: number;
        name: string;
        position: number;
    }

    interface ProductTypeWithStatuses extends ProductType {
        statuses: ProductionStatus[];
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

    type OrderStatus =
        | 'pendiente'
        | 'en producción'
        | 'terminado'
        | 'entregado parcial'
        | 'entregado'
        | 'cancelado';

    interface Order {
        id: number;
        notes: string;
        client_id: number;
        classroom_id: number;
        total_price: number;
        payment_plan: number;
        due_date: string;
        child_name?: string;
        attended_photo_session?: boolean;
        photo_number?: number | null;
        photo_url?: string | null;
        cancelled_at?: string | null;
        status?: OrderStatus | null;
        paid_total?: number;
        balance?: number;
        can_edit?: boolean;
        can_delete?: boolean;
        client: Client;
        classroom: Classroom;
        school: School;
        products: OrderProduct[];
        payments?: Payment[];
    }

    interface Payment {
        id: number;
        order_id: number;
        amount: number;
        type: string;
        proof_of_payment: string | null;
        paid_at: string;
        paid_on?: string;
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

    interface Photo {
        id: number;
        classroom_id: number;
        file_path: string;
        number: number;
        created_at: string;
        updated_at: string;
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
