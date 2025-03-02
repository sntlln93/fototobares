import { PaginationNav } from '@/components/paginationNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Diff, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { AlterStockForm } from './partials/alterStockForm';
import { DeleteStockableConfirmation } from './partials/deleteStockableConfirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stockeables',
        href: '/stockables',
    },
];

export default function Stockables({
    stockables,
}: PageProps<Paginated<Stockable>>) {
    const [showAddStockModal, setShowAddStockModal] =
        useState<Stockable | null>(null);
    const [
        showDeleteStockableConfirmation,
        setShowDeleteStockableConfirmation,
    ] = useState<Stockable | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            {showAddStockModal ? (
                <AlterStockForm
                    stockable={showAddStockModal}
                    show={Boolean(showAddStockModal)}
                    onClose={() => setShowAddStockModal(null)}
                />
            ) : undefined}

            {showDeleteStockableConfirmation ? (
                <DeleteStockableConfirmation
                    stockable={showDeleteStockableConfirmation}
                    show={Boolean(showDeleteStockableConfirmation)}
                    onClose={() => setShowDeleteStockableConfirmation(null)}
                />
            ) : undefined}

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="stockables.index" />

                    <Button asChild>
                        <Link href={route('stockables.create')}>
                            <Plus />
                            Agregar stockeable
                        </Link>
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('id', 'stockables.index')
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
                                            onSort('name', 'stockables.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Stockeable
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort(
                                                'quantity',
                                                'stockables.index',
                                            )
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Cantidad
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Productos
                                </div>
                            </TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stockables.data.map((stockable) => (
                            <TableRow key={stockable.id}>
                                <TableCell className="font-medium">
                                    {stockable.id}
                                </TableCell>
                                <TableCell>{stockable.name}</TableCell>
                                <TableCell>
                                    {stockable.quantity < stockable.alert_at ? (
                                        <Badge variant="destructive">
                                            {`${stockable.quantity} (${stockable.unit})`}
                                        </Badge>
                                    ) : (
                                        `${stockable.quantity} (${stockable.unit})`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {stockable.products
                                        .map((product) => product.name)
                                        .join(', ')}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size={'sm'}
                                        variant={'warning'}
                                        onClick={() =>
                                            router.visit(
                                                route('stockables.edit', {
                                                    stockable: stockable.id,
                                                }),
                                            )
                                        }
                                    >
                                        <Edit2 />
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() =>
                                            setShowDeleteStockableConfirmation(
                                                stockable,
                                            )
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant="secondary"
                                        onClick={() =>
                                            setShowAddStockModal(stockable)
                                        }
                                    >
                                        <Diff />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={stockables.meta.links} />
            </section>
        </AppLayout>
    );
}
