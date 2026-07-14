import { buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Highlight } from '@/features/highlight';
import { PhoneLink } from '@/features/phone-link';
import { cn, formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface StudentsTableProps {
    orders: Order[];
    /** The applied search term, marked in the columns it matched. */
    search?: string | null;
}

export function StudentsTable({ orders, search }: StudentsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-25">N° de orden</TableHead>
                    <TableHead>Nombre del Niño</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">
                            {order.photo_number != null ? (
                                <Highlight
                                    text={String(order.photo_number)}
                                    term={search}
                                />
                            ) : (
                                '—'
                            )}
                        </TableCell>
                        <TableCell>
                            {order.child_name ? (
                                <Highlight
                                    text={order.child_name}
                                    term={search}
                                />
                            ) : (
                                '—'
                            )}
                        </TableCell>
                        <TableCell>
                            {order.client.name ? (
                                <Highlight
                                    text={order.client.name}
                                    term={search}
                                />
                            ) : (
                                'Sin especificar'
                            )}
                        </TableCell>
                        <TableCell>
                            <PhoneLink
                                phone={order.client.phone}
                                term={search}
                            />
                        </TableCell>
                        <TableCell>{order.products.length}</TableCell>
                        <TableCell>{formatPrice(order.total_price)}</TableCell>
                        <TableCell>
                            {order.payment_plan} (
                            {formatPrice(
                                order.total_price / order.payment_plan,
                            )}
                            )
                        </TableCell>
                        <TableCell>{order.due_date}</TableCell>
                        <TableCell>
                            <Link
                                className={cn(
                                    buttonVariants({
                                        size: 'sm',
                                        variant: 'outline',
                                    }),
                                )}
                                href={route('orders.show', {
                                    order: order.id,
                                })}
                            >
                                Ver
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
