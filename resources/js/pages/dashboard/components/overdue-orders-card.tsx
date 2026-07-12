import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { OverdueOrder } from '../hooks/use-dashboard';

export function OverdueOrdersCard({
    overdueOrders,
}: {
    overdueOrders: OverdueOrder[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    Pedidos vencidos con saldo pendiente
                </CardTitle>
                <CardDescription>
                    Pasó el primer vencimiento y todavía no están pagados al
                    100%
                </CardDescription>
            </CardHeader>
            <CardContent>
                {overdueOrders.length === 0 ? (
                    <CardDescription>
                        No hay pedidos vencidos con saldo pendiente.
                    </CardDescription>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Escuela</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Link
                                            href={route('orders.show', {
                                                order: order.id,
                                            })}
                                            className="underline-offset-2 hover:underline"
                                        >
                                            #{order.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {order.client}
                                        {order.child_name
                                            ? ` (${order.child_name})`
                                            : ''}
                                    </TableCell>
                                    <TableCell>{order.school}</TableCell>
                                    <TableCell>{order.due_date}</TableCell>
                                    <TableCell className="font-semibold text-amber-600">
                                        {formatPrice(order.balance)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
