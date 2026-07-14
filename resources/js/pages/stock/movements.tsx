import { PaginationNav } from '@/components/paginationNav';
import { Badge } from '@/components/ui/badge';
import {
    Card,
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
import AppLayout from '@/layouts/app-layout';
import { capitalize } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type MovementRow = {
    id: number;
    stockable: string;
    quantity: number;
    reason: string;
    user: string | null;
    order_id: number | null;
    product: string | null;
    created_at: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stockeables',
        href: route('stockables.index'),
    },
    {
        title: 'Movimientos',
        href: route('stock-movements.index'),
    },
];

export default function StockMovements({
    movements,
}: PageProps<{
    // Plain Laravel paginator: `links` lives at the root, not under `meta`
    movements: { data: MovementRow[]; links: PaginatedLink[] };
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movimientos de stock" />

            <section className="p-6">
                <h1 className="mb-4 text-3xl font-bold">
                    Movimientos de stock
                </h1>

                {movements.data.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">#</TableHead>
                                    <TableHead>Insumo</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Pedido / Producto</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements.data.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell className="font-medium">
                                            {movement.id}
                                        </TableCell>
                                        <TableCell>
                                            {movement.stockable}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    movement.quantity < 0
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {movement.quantity > 0
                                                    ? `+${movement.quantity}`
                                                    : movement.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {capitalize(movement.reason)}
                                        </TableCell>
                                        <TableCell>
                                            {movement.order_id ? (
                                                <Link
                                                    href={route('orders.show', {
                                                        order: movement.order_id,
                                                    })}
                                                    className="underline-offset-2 hover:underline"
                                                >
                                                    #{movement.order_id}
                                                    {movement.product
                                                        ? ` (${movement.product})`
                                                        : ''}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {movement.user ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {movement.created_at}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationNav links={movements.links} />
                    </>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Sin movimientos</CardTitle>
                            <CardDescription>
                                Los movimientos automáticos por producción y los
                                ajustes o devoluciones por cancelación van a
                                aparecer acá.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </AppLayout>
    );
}
