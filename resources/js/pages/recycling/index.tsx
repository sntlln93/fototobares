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
import { Recycle } from 'lucide-react';

type RecycledItem = {
    id: number;
    order_id: number;
    client_name: string;
    child_name: string | null;
    school: string;
    classroom: string;
    product_name: string;
    product_type: string | null;
    variant: Record<string, string> | null;
    note: string | null;
    destination: 'stock' | 'reciclaje';
    last_status: string | null;
    recycled_at: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reciclaje',
        href: route('recycling.index'),
    },
];

export default function Recycling({
    items,
}: PageProps<{
    // Plain Laravel paginator: `links` lives at the root, not under `meta`
    items: { data: RecycledItem[]; links: PaginatedLink[] };
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reciclaje" />

            <section className="p-6">
                <div className="mb-4">
                    <h1 className="flex items-center gap-2 text-3xl font-bold">
                        <Recycle className="h-8 w-8" />
                        Reciclaje
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Productos de pedidos cancelados: los que volvieron a
                        stock y los que quedaron disponibles para reutilizar.
                    </p>
                </div>

                {items.data.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pedido</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cliente / Niño</TableHead>
                                    <TableHead>Escuela (Aula)</TableHead>
                                    <TableHead>Último estado</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Link
                                                href={route('orders.show', {
                                                    order: item.order_id,
                                                })}
                                                className="underline-offset-2 hover:underline"
                                            >
                                                #{item.order_id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{item.product_name}</span>
                                                {item.product_type && (
                                                    <span className="text-xs text-gray-500">
                                                        {capitalize(
                                                            item.product_type,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.client_name}
                                            {item.child_name
                                                ? ` / ${item.child_name}`
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {item.school} (
                                            {item.classroom.toUpperCase()})
                                        </TableCell>
                                        <TableCell>
                                            {item.last_status ?? 'Sin empezar'}
                                        </TableCell>
                                        <TableCell>
                                            {item.destination === 'stock' ? (
                                                <Badge variant="secondary">
                                                    Devuelto a stock
                                                </Badge>
                                            ) : (
                                                <Badge>Reciclaje</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.recycled_at}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationNav links={items.links} />
                    </>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Nada en reciclaje</CardTitle>
                            <CardDescription>
                                Cuando canceles un pedido, sus productos van a
                                aparecer acá.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </AppLayout>
    );
}
