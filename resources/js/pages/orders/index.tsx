import { PaginationNav } from '@/components/paginationNav';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, School } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
];

export default function Orders({
    orders,
    schools,
}: PageProps<Paginated<Order> & { schools: School[] }>) {
    const params = new URLSearchParams(window.location.search);

    const [comboDropdownOpen, setComboDropdownOpen] = useState(false);
    const [selectedSchool] = useState<number | null>(
        params.get('school_id') ? Number(params.get('school_id')!) : null,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <section className="p-6">
                <div className="mb-4 flex gap-4">
                    <Searchbar indexRoute="orders.index" />
                    <Combobox
                        items={schools.map((school) => ({
                            label: school.name,
                            value: school.id,
                        }))}
                        action={(value) => {
                            params.set('school_id', value);
                            router.get(
                                `${route('orders.index')}?${params.toString()}`,
                            );
                        }}
                        open={comboDropdownOpen}
                        setOpen={setComboDropdownOpen}
                        placeholder="Buscar combo"
                    >
                        <Button variant="secondary" role="combobox">
                            {selectedSchool
                                ? schools.find(
                                      (school) => school.id === selectedSchool,
                                  )?.name || 'Filtrar por escuela'
                                : 'Filtrar por escuela'}
                            <School />
                        </Button>
                    </Combobox>
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
                                    Cliente
                                </div>
                            </TableHead>
                            <TableHead>Productos</TableHead>
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
                            <TableHead>Cuotas ($)</TableHead>
                            <TableHead>Escuela (Aula)</TableHead>
                            <TableHead>Vencimiento</TableHead>
                            {/* <TableHead>Acciones</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    {order.id}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    {order.client.name}
                                </TableCell>
                                <TableCell>{order.products.length}</TableCell>
                                <TableCell>
                                    {formatPrice(order.total_price)}
                                </TableCell>
                                <TableCell>
                                    {order.payments} (
                                    {formatPrice(
                                        order.total_price / order.payments,
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
                                {/* <TableCell className="flex gap-2">
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
                                        onClick={() =>
                                            alert(JSON.stringify(order))
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={orders.meta.links} />
            </section>
        </AppLayout>
    );
}
