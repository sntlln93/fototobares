import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { PackageCheck } from 'lucide-react';
import { useDelivery } from '../hooks/use-delivery';
import { DeliveredList } from './delivered-list';
import { DeliveryWarningModal } from './delivery-warning-modal';
import { UndeliveredList } from './undelivered-list';

export function DeliveryCard({
    order,
    onPayBalance,
}: {
    order: Order;
    onPayBalance: () => void;
}) {
    const {
        selected,
        pendingDelivery,
        setPendingDelivery,
        undelivered,
        delivered,
        balance,
        toggle,
        deliver,
        requestDelivery,
        undo,
    } = useDelivery(order);

    return (
        <Card>
            {pendingDelivery && (
                <DeliveryWarningModal
                    show={Boolean(pendingDelivery)}
                    balance={balance}
                    onClose={() => setPendingDelivery(null)}
                    onPayBalance={onPayBalance}
                    onConfirm={() => deliver(pendingDelivery)}
                />
            )}

            <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                    <span>Entrega</span>
                    {undelivered.length > 0 && (
                        <Button
                            size="sm"
                            className="text-xs font-bold uppercase"
                            onClick={() =>
                                requestDelivery(
                                    undelivered.map(
                                        (product) => product.order_detail_id,
                                    ),
                                )
                            }
                        >
                            <PackageCheck className="mr-1 h-4 w-4" />
                            Entregar todo
                        </Button>
                    )}
                </CardTitle>
                {balance > 0 && (
                    <CardDescription className="text-amber-600">
                        Saldo pendiente: {formatPrice(balance)}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {undelivered.length === 0 && delivered.length === 0 && (
                    <CardDescription className="text-center text-gray-500">
                        No hay productos para entregar.
                    </CardDescription>
                )}

                {undelivered.length > 0 && (
                    <UndeliveredList
                        undelivered={undelivered}
                        selected={selected}
                        onToggle={toggle}
                        onDeliverSelected={() => requestDelivery(selected)}
                    />
                )}

                {delivered.length > 0 && (
                    <DeliveredList delivered={delivered} onUndo={undo} />
                )}
            </CardContent>
        </Card>
    );
}
