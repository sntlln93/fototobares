import { PaginationNav } from '@/components/paginationNav';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { DeleteOrderConfirmation } from './components/delete-confirmation';
import {
    OrderFilters,
    OrderIndexFilters,
    SchoolWithClassrooms,
} from './components/order-filters';
import { OrdersTable } from './components/orders-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
];

export default function Orders({
    orders,
    schools,
    filters,
}: PageProps<{
    orders: Paginated<Order>;
    schools: SchoolWithClassrooms[];
    filters: OrderIndexFilters;
}>) {
    const [deleteableOrder, setDeleteableOrder] = useState<Order | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            {deleteableOrder && (
                <DeleteOrderConfirmation
                    order={deleteableOrder}
                    show={Boolean(deleteableOrder)}
                    onClose={() => setDeleteableOrder(null)}
                />
            )}

            <section className="p-6">
                <OrderFilters schools={schools} filters={filters} />

                <OrdersTable
                    orders={orders.data}
                    search={filters.search}
                    onDelete={setDeleteableOrder}
                />

                <PaginationNav links={orders.meta.links} />
            </section>
        </AppLayout>
    );
}
