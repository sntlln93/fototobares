import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn, formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2 } from 'lucide-react';
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
                <Card className="relative lg:min-w-[400px]">
                    {order.data.can_edit ? (
                        <Link
                            href={route('orders.edit', {
                                order: order.data.id,
                            })}
                            className={cn(
                                'absolute right-4 top-4',
                                buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                }),
                            )}
                        >
                            <Edit2 />
                        </Link>
                    ) : (
                        <span
                            className={cn(
                                'absolute right-4 top-4 opacity-60',
                                buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                }),
                            )}
                            aria-disabled="true"
                            title="La edición se bloquea cuando la primera cuota está pagada"
                        >
                            <Edit2 />
                        </span>
                    )}
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
                        {!order.data.can_edit && (
                            <CardDescription className="text-amber-600">
                                La edición se bloquea cuando la primera cuota
                                está pagada.
                            </CardDescription>
                        )}
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
