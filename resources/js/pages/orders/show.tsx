import { Masonry } from '@/components/masonry';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CancelOrderModal } from './components/cancel-order-modal';
import { DeliveryCard } from './components/delivery';
import { Details } from './components/details';
import { OrderInfoCard } from './components/order-info-card';
import { OrderNotes } from './components/order-notes';
import { PaymentHistory } from './components/payment-history';

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

            <section className="px-6 py-6">
                <Masonry
                    items={[
                        {
                            key: 'info',
                            content: (
                                <OrderInfoCard
                                    order={data}
                                    onCancel={() => setShowCancelModal(true)}
                                />
                            ),
                        },
                        {
                            key: 'details',
                            content: <Details order={data} />,
                        },
                        ...(isCancelled
                            ? []
                            : [
                                  {
                                      key: 'delivery',
                                      content: (
                                          <DeliveryCard
                                              order={data}
                                              onPayBalance={openPayBalance}
                                          />
                                      ),
                                  },
                              ]),
                        {
                            key: 'payments',
                            content: (
                                <PaymentHistory
                                    order={data}
                                    payments={data.payments || []}
                                    showCreatePayment={showCreatePayment}
                                    setShowCreatePayment={(show) => {
                                        setShowCreatePayment(show);
                                        if (!show)
                                            setPaymentInitialAmount(null);
                                    }}
                                    initialAmount={paymentInitialAmount}
                                    canRegister={!isCancelled}
                                />
                            ),
                        },
                        {
                            key: 'notes',
                            content: (
                                <OrderNotes
                                    order={data}
                                    notes={data.notes || []}
                                />
                            ),
                        },
                    ]}
                />
            </section>
        </AppLayout>
    );
}
