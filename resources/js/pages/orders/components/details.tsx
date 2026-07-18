import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useDetailPriority } from '../hooks/use-detail-priority';
import { useDetailProductionStatus } from '../hooks/use-detail-production-status';
import { DetailItem } from './detail-item';

export function Details({ order }: { order: Order }) {
    const { toggle } = useDetailPriority(order.id);
    const { setStatus, disableProduction } = useDetailProductionStatus(
        order.id,
    );
    const products = order.products || [];
    const isCancelled = Boolean(order.cancelled_at);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Detalle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {products.length ? (
                    products.map((product) => (
                        <DetailItem
                            orderId={order.id}
                            product={product}
                            key={product.id}
                            canPrioritize={
                                !isCancelled &&
                                !product.delivered_at &&
                                !product.recycled_to
                            }
                            onTogglePriority={() =>
                                toggle(
                                    product.order_detail_id,
                                    !product.priority,
                                )
                            }
                            firstInstallmentPaid={Boolean(
                                order.first_installment_paid,
                            )}
                            onStatusChange={(statusId) =>
                                setStatus(product.order_detail_id, statusId)
                            }
                            onDisableProduction={() =>
                                disableProduction(product.order_detail_id)
                            }
                            canEditVariant={
                                !isCancelled &&
                                !product.recycled_to &&
                                Boolean(product.variants?.length)
                            }
                        />
                    ))
                ) : (
                    <CardDescription className="text-center text-gray-500">
                        Algo salió mal, no hay productos en este pedido.
                        Consulte con el administrador.
                    </CardDescription>
                )}
            </CardContent>
        </Card>
    );
}
