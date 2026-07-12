import { Modal } from '@/components/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { AlertTriangle, PackageCheck, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeliveryCard({
    order,
    onPayBalance,
}: {
    order: Order;
    onPayBalance: () => void;
}) {
    const [selected, setSelected] = useState<number[]>([]);
    const [pendingDelivery, setPendingDelivery] = useState<number[] | null>(
        null,
    );

    const products = order.products.filter((product) => !product.recycled_to);
    const undelivered = products.filter((product) => !product.delivered_at);
    const delivered = products.filter((product) => product.delivered_at);

    const balance = order.balance ?? 0;

    const toggle = (detailId: number) => {
        setSelected((prev) =>
            prev.includes(detailId)
                ? prev.filter((id) => id !== detailId)
                : [...prev, detailId],
        );
    };

    const deliver = (detailIds: number[]) => {
        router.put(
            route('orders.delivery', { order: order.id }),
            {
                detail_ids: detailIds,
                action: 'deliver',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    setPendingDelivery(null);
                    toast.success('Entrega registrada');
                },
                onError: () => toast.error('No se pudo registrar la entrega'),
            },
        );
    };

    const requestDelivery = (detailIds: number[]) => {
        if (detailIds.length === 0) {
            toast.error('Seleccioná al menos un producto para entregar');
            return;
        }

        if (balance > 0) {
            // Ignorable warning: the client asked to be able to deliver anyway
            setPendingDelivery(detailIds);
            return;
        }

        deliver(detailIds);
    };

    const undo = (detailId: number) => {
        router.put(
            route('orders.delivery', { order: order.id }),
            {
                detail_ids: [detailId],
                action: 'undeliver',
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Entrega deshecha'),
            },
        );
    };

    return (
        <Card className="lg:min-w-100">
            {pendingDelivery && (
                <Modal
                    show={Boolean(pendingDelivery)}
                    onClose={() => setPendingDelivery(null)}
                >
                    <div className="p-6">
                        <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Este pedido no está pagado al 100%
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Queda un saldo pendiente de{' '}
                            <strong>{formatPrice(balance)}</strong>. Podés
                            cancelar el saldo ahora o entregar de todas formas.
                        </p>

                        <div className="mt-6 flex flex-col justify-end gap-2 md:flex-row">
                            <Button
                                variant="outline"
                                onClick={() => setPendingDelivery(null)}
                            >
                                Volver
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setPendingDelivery(null);
                                    onPayBalance();
                                }}
                            >
                                Cancelar saldo ({formatPrice(balance)})
                            </Button>
                            <Button onClick={() => deliver(pendingDelivery)}>
                                Entregar igualmente
                            </Button>
                        </div>
                    </div>
                </Modal>
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
                    <div>
                        <p className="mb-2 text-sm font-medium">
                            Pendientes de entrega
                        </p>
                        <ul className="space-y-2">
                            {undelivered.map((product) => (
                                <li
                                    key={product.order_detail_id}
                                    className="flex items-center justify-between rounded-md border border-input px-3 py-2"
                                >
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selected.includes(
                                                product.order_detail_id,
                                            )}
                                            onChange={() =>
                                                toggle(product.order_detail_id)
                                            }
                                        />
                                        {product.name}
                                    </label>
                                    <Badge variant="outline">
                                        {product.production_status ??
                                            'Sin empezar'}
                                    </Badge>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className="mt-3 w-full"
                            variant="secondary"
                            disabled={selected.length === 0}
                            onClick={() => requestDelivery(selected)}
                        >
                            Entregar seleccionados ({selected.length})
                        </Button>
                    </div>
                )}

                {delivered.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium">Entregados</p>
                        <ul className="space-y-2">
                            {delivered.map((product) => (
                                <li
                                    key={product.order_detail_id}
                                    className="flex items-center justify-between rounded-md border border-input bg-green-50 px-3 py-2 text-sm dark:bg-green-950/30"
                                >
                                    <span>{product.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-600 hover:bg-green-600">
                                            Entregado
                                        </Badge>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            title="Deshacer entrega"
                                            onClick={() =>
                                                undo(product.order_detail_id)
                                            }
                                        >
                                            <Undo2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
