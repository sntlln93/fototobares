import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Ban, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { DeliveryCard } from './delivery';
import { Details } from './details';
import { CancelOrderModal } from './partials/cancel-order-modal';
import { PaymentHistory } from './payment-history';

const STATUS_STYLES: Record<string, string> = {
    pendiente: 'bg-gray-500 hover:bg-gray-500',
    'en producción': 'bg-blue-600 hover:bg-blue-600',
    terminado: 'bg-violet-600 hover:bg-violet-600',
    'entregado parcial': 'bg-amber-600 hover:bg-amber-600',
    entregado: 'bg-green-600 hover:bg-green-600',
    cancelado: 'bg-red-600 hover:bg-red-600',
};

export default function Order({
    order,
}: PageProps<{
    order: {
        data: Order;
    };
}>) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCreatePayment, setShowCreatePayment] = useState(false);
    const [paymentInitialAmount, setPaymentInitialAmount] = useState<
        number | null
    >(null);

    const data = order.data;
    const isCancelled = Boolean(data.cancelled_at);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pedidos',
            href: route('orders.index'),
        },
        {
            title: `Pedido #${data.id}`,
            href: route('orders.show', { order: data.id }),
        },
    ];

    const openPayBalance = () => {
        setPaymentInitialAmount(data.balance ?? null);
        setShowCreatePayment(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido #${data.id}`} />

            {showCancelModal && (
                <CancelOrderModal
                    order={data}
                    show={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                />
            )}

            <section className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:flex-wrap">
                <Card className="relative lg:min-w-[400px]">
                    {data.can_edit ? (
                        <Link
                            href={route('orders.edit', {
                                order: data.id,
                            })}
                            className={cn(
                                'absolute top-4 right-4',
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
                                'absolute top-4 right-4 opacity-60',
                                buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                }),
                            )}
                            aria-disabled="true"
                            title="La edición se bloquea cuando la primera cuota está pagada o el pedido está cancelado"
                        >
                            <Edit2 />
                        </span>
                    )}
                    <CardHeader>
                        <CardDescription>
                            {`${data.school.name}
                            (${data.classroom.name})`}
                        </CardDescription>
                        <CardTitle className="flex items-center gap-2">
                            {data.client.name}
                            {data.status && (
                                <Badge
                                    className={cn(STATUS_STYLES[data.status])}
                                >
                                    {data.status}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {`Pedido #${data.id}`}
                            {data.child_name
                                ? ` · Niño/a: ${data.child_name}`
                                : ''}
                            {data.photo_number !== null &&
                            data.photo_number !== undefined
                                ? ` · Foto N° ${data.photo_number}`
                                : ''}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {data.photo_url && (
                            <a
                                href={data.photo_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src={data.photo_url}
                                    alt={`Foto N° ${data.photo_number}`}
                                    className="mb-3 h-32 w-32 rounded-md object-cover"
                                />
                            </a>
                        )}
                        <CardDescription>
                            Total: {formatPrice(data.total_price)}
                        </CardDescription>
                        <CardDescription>
                            Pagado: {formatPrice(data.paid_total ?? 0)}
                        </CardDescription>
                        <CardDescription
                            className={
                                (data.balance ?? 0) > 0
                                    ? 'font-semibold text-amber-600'
                                    : 'text-green-600'
                            }
                        >
                            Saldo: {formatPrice(data.balance ?? 0)}
                        </CardDescription>
                        <CardDescription>
                            Cuotas: {data.payment_plan}
                        </CardDescription>
                        <CardDescription>
                            Primer vencimiento: {data.due_date}
                        </CardDescription>

                        {isCancelled && (
                            <CardDescription className="mt-2 font-semibold text-red-600">
                                Pedido cancelado el {data.cancelled_at}.
                            </CardDescription>
                        )}

                        {!data.can_edit && !isCancelled && (
                            <CardDescription className="text-amber-600">
                                La edición se bloquea cuando la primera cuota
                                está pagada.
                            </CardDescription>
                        )}

                        {!isCancelled && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 text-red-600 hover:text-red-700"
                                onClick={() => setShowCancelModal(true)}
                            >
                                <Ban className="mr-1 h-4 w-4" />
                                Cancelar pedido
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Details products={data.products || []} />

                {!isCancelled && (
                    <DeliveryCard order={data} onPayBalance={openPayBalance} />
                )}

                <PaymentHistory
                    order={data}
                    payments={data.payments || []}
                    showCreatePayment={showCreatePayment}
                    setShowCreatePayment={(show) => {
                        setShowCreatePayment(show);
                        if (!show) setPaymentInitialAmount(null);
                    }}
                    initialAmount={paymentInitialAmount}
                    canRegister={!isCancelled}
                />
            </section>
        </AppLayout>
    );
}
