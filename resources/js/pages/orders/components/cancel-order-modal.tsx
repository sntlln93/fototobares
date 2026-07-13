import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type Destination = 'stock' | 'reciclaje';

/**
 * Cancels an order: each product goes back to stock (supplies are returned)
 * or to the recycling bin, chosen individually.
 */
export function CancelOrderModal({
    order,
    show,
    onClose,
}: {
    order: Order;
    show: boolean;
    onClose: () => void;
}) {
    const [destinations, setDestinations] = useState<
        Record<number, Destination>
    >(
        Object.fromEntries(
            order.products
                .filter((product) => !product.recycled_to)
                .map((product) => [product.order_detail_id, 'reciclaje']),
        ),
    );
    const [processing, setProcessing] = useState(false);

    const products = order.products.filter((product) => !product.recycled_to);

    const submit = () => {
        setProcessing(true);

        router.post(
            route('orders.cancel', { order: order.id }),
            {
                destinations: products.map((product) => ({
                    detail_id: product.order_detail_id,
                    destination: destinations[product.order_detail_id],
                })),
            },
            {
                onSuccess: () => {
                    toast.success('Pedido cancelado');
                    onClose();
                },
                onError: () => toast.error('No se pudo cancelar el pedido'),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Cancelar pedido #{order.id}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Elegí a dónde vuelve cada producto. Si vuelve a stock, sus
                    insumos se devuelven al inventario; si va a reciclaje, queda
                    listado en el módulo de reciclaje.
                </p>

                <ul className="mt-4 space-y-2">
                    {products.map((product) => (
                        <li
                            key={product.order_detail_id}
                            className="flex items-center justify-between gap-2 rounded-md border border-input px-3 py-2"
                        >
                            <span className="text-sm">{product.name}</span>
                            <Select
                                value={destinations[product.order_detail_id]}
                                onValueChange={(value) =>
                                    setDestinations((prev) => ({
                                        ...prev,
                                        [product.order_detail_id]:
                                            value as Destination,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reciclaje">
                                        Reciclaje
                                    </SelectItem>
                                    <SelectItem value="stock">Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex flex-col justify-end gap-2 md:flex-row">
                    <Button variant="outline" onClick={onClose}>
                        Volver
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={processing || products.length === 0}
                        onClick={submit}
                    >
                        Confirmar cancelación
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
