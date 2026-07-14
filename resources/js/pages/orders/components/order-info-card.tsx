import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Ban, Edit2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    pendiente: 'bg-gray-500 hover:bg-gray-500',
    'en producción': 'bg-blue-600 hover:bg-blue-600',
    terminado: 'bg-violet-600 hover:bg-violet-600',
    'entregado parcial': 'bg-amber-600 hover:bg-amber-600',
    entregado: 'bg-green-600 hover:bg-green-600',
    cancelado: 'bg-red-600 hover:bg-red-600',
};

interface OrderInfoCardProps {
    order: Order;
    onCancel: () => void;
}

export function OrderInfoCard({ order, onCancel }: OrderInfoCardProps) {
    const isCancelled = Boolean(order.cancelled_at);

    return (
        <Card className="relative">
            {order.can_edit ? (
                <Link
                    href={route('orders.edit', {
                        order: order.id,
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
                    {`${order.school.name}
                    (${order.classroom.name})`}
                </CardDescription>
                <CardTitle className="flex items-center gap-2">
                    {order.client.name}
                    {order.status && (
                        <Badge className={cn(STATUS_STYLES[order.status])}>
                            {order.status}
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    {`Pedido #${order.id}`}
                    {order.child_name ? ` · Niño/a: ${order.child_name}` : ''}
                    {order.photo_number !== null &&
                    order.photo_number !== undefined
                        ? ` · Foto N° ${order.photo_number}`
                        : ''}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {order.photo_url && (
                    <a href={order.photo_url} target="_blank" rel="noreferrer">
                        <img
                            src={order.photo_url}
                            alt={`Foto N° ${order.photo_number}`}
                            className="mb-3 h-32 w-32 rounded-md object-cover"
                        />
                    </a>
                )}
                <CardDescription>
                    Total: {formatPrice(order.total_price)}
                </CardDescription>
                <CardDescription>
                    Pagado: {formatPrice(order.paid_total ?? 0)}
                </CardDescription>
                <CardDescription
                    className={
                        (order.balance ?? 0) > 0
                            ? 'font-semibold text-amber-600'
                            : 'text-green-600'
                    }
                >
                    Saldo: {formatPrice(order.balance ?? 0)}
                </CardDescription>
                <CardDescription>Cuotas: {order.payment_plan}</CardDescription>
                <CardDescription>
                    Primer vencimiento: {order.due_date}
                </CardDescription>

                {isCancelled && (
                    <CardDescription className="mt-2 font-semibold text-red-600">
                        Pedido cancelado el {order.cancelled_at}.
                    </CardDescription>
                )}

                {!order.can_edit && !isCancelled && (
                    <CardDescription className="text-amber-600">
                        La edición se bloquea cuando la primera cuota está
                        pagada.
                    </CardDescription>
                )}

                {!isCancelled && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 text-red-600 hover:text-red-700"
                        onClick={onCancel}
                    >
                        <Ban className="mr-1 h-4 w-4" />
                        Cancelar pedido
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
