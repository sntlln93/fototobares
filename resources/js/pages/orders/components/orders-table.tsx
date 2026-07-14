import { Button, buttonVariants } from '@/components/ui/button';
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
import { onSort } from '@/lib/services/filter';
import { cn, formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowUpDown, Eye, Trash } from 'lucide-react';
import { ProductsTooltip } from './products-tooltip';

interface OrdersTableProps {
    orders: Order[];
    /** The applied search term, marked in the columns it matched. */
    search?: string | null;
    onDelete: (order: Order) => void;
}

export function OrdersTable({ orders, search, onDelete }: OrdersTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-25">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onSort('id', 'orders.index')}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                            #
                        </div>
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    onSort('total_price', 'orders.index')
                                }
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                            Precio
                        </div>
                    </TableHead>
                    <TableHead>Cuotas ($)</TableHead>
                    <TableHead>Escuela (Aula)</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">
                            <Highlight text={String(order.id)} term={search} />
                        </TableCell>
                        <TableCell>
                            <Highlight text={order.client.name} term={search} />
                        </TableCell>
                        <TableCell>
                            <PhoneLink
                                phone={order.client.phone}
                                term={search}
                            />
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1">
                                {order.products.length}
                                <ProductsTooltip products={order.products} />
                            </div>
                        </TableCell>
                        <TableCell>{formatPrice(order.total_price)}</TableCell>
                        <TableCell>
                            {order.payment_plan} (
                            {formatPrice(
                                order.total_price / order.payment_plan,
                            )}
                            )
                        </TableCell>
                        <TableCell>
                            <Link
                                href={route('schools.show', {
                                    school: order.school.id,
                                })}
                            >
                                {order.school.name}
                            </Link>{' '}
                            ({order.classroom.name})
                        </TableCell>
                        <TableCell>{order.due_date}</TableCell>
                        <TableCell className="flex gap-2">
                            <Link
                                className={cn(
                                    buttonVariants({
                                        size: 'sm',
                                        variant: 'outline',
                                    }),
                                )}
                                href={route('orders.show', { order: order.id })}
                            >
                                <Eye />
                            </Link>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!order.can_delete}
                                title={
                                    order.can_delete
                                        ? 'Eliminar pedido'
                                        : 'No se puede eliminar un pedido con pagos registrados'
                                }
                                onClick={() => onDelete(order)}
                            >
                                <Trash />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
