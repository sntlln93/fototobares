import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { OrderInfoCard } from './components/order-info-card';
import { DeliveryCard } from './delivery';
import { Details } from './details';
import { CancelOrderModal } from './partials/cancel-order-modal';
import { PaymentHistory } from './payment-history';

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
                <OrderInfoCard
                    order={data}
                    onCancel={() => setShowCancelModal(true)}
                />

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
