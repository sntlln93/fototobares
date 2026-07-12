import { Accordion } from '@/components/ui/accordion';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { EditClientStep } from './components/edit-client-step';
import { EditOrderStep } from './components/edit-order-step';
import { EditProductsStep } from './components/edit-products-step';
import { useEditOrder } from './hooks/use-edit-order';

export default function EditOrder({
    order,
}: PageProps<{
    order: Order;
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pedidos',
            href: route('orders.index'),
        },
        {
            title: `Editar Pedido #${order.id}`,
            href: route('orders.edit', { order: order.id }),
        },
    ];

    const form = useEditOrder(order);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Pedido #${order.id}`} />

            <form onSubmit={form.submit} className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={form.accordionValue}
                >
                    <EditClientStep form={form} orderId={order.id} />
                    <EditProductsStep form={form} products={order.products} />
                    <EditOrderStep form={form} orderId={order.id} />
                </Accordion>
            </form>
        </AppLayout>
    );
}
