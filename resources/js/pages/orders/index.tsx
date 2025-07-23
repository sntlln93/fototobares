import { PaginationNav } from '@/components/paginationNav';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { onSort } from '@/lib/services/filter';
import { formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
];

export default function Orders({ orders }: PageProps<Paginated<Order>>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="orders.index" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('id', 'products.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    #
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('name', 'products.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Producto
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort(
                                                'unit_price',
                                                'products.index',
                                            )
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Precio
                                </div>
                            </TableHead>
                            <TableHead>Cuotas máximas</TableHead>
                            <TableHead>Medidas</TableHead>
                            <TableHead>Diseño</TableHead>
                            <TableHead>Fondos</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    {order.id}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    {order.id}
                                </TableCell>
                                <TableCell>
                                    {formatPrice(order.total_price)}
                                </TableCell>
                                <TableCell>{order.payments}</TableCell>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.id}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Link
                                        className={buttonVariants({
                                            variant: 'warning',
                                            size: 'sm',
                                        })}
                                        href={route('dashboard')}
                                    >
                                        <Edit2 />
                                    </Link>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() => console.log(order)}
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={orders.meta.links} />
            </section>
        </AppLayout>
    );
}
