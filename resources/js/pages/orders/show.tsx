import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Details } from './details';
import { PaymentHistory } from './payment-history';

export default function Order({
    order,
}: PageProps<{
    order: {
        data: Order;
    };
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pedidos',
            href: route('orders.index'),
        },
        {
            title: `Pedido #${order.data.id}`,
            href: route('orders.show', { order: order.data.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido #${order.data.id} - Pagos`} />

            <section className="flex flex-col gap-6 px-6 pt-6 lg:flex-row">
                <Card className="lg:min-w-[400px]">
                    <CardHeader>
                        <CardDescription>
                            {`${order.data.school.name}
                            (${order.data.classroom.name})`}
                        </CardDescription>
                        <CardTitle>{order.data.client.name}</CardTitle>
                        <CardDescription>{`Pedido #${order.data.id}`}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <CardDescription>
                            Total: {formatPrice(order.data.total_price)}
                        </CardDescription>
                        <CardDescription>
                            Cuotas: {order.data.payment_plan}
                        </CardDescription>
                        <CardDescription>
                            Primer vencimiento: {order.data.due_date}
                        </CardDescription>
                    </CardContent>
                </Card>

                <Details products={order.data.products || []} />

                <PaymentHistory
                    orderId={order.data.id}
                    payments={order.data.payments || []}
                />
            </section>
        </AppLayout>
    );
}
