import { Card } from '@/components/card';
import { PaginationNav } from '@/components/paginationNav';
import { TextInput } from '@/components/textInput';
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
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { onSearch, onSort } from '@/lib/services/filter';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    Diff,
    Edit2,
    FilterX,
    Plus,
    Search,
    Trash,
} from 'lucide-react';
import { useState } from 'react';
import { AlterStockForm } from './partials/alterStockForm';
import { DeleteStockableConfirmation } from './partials/deleteStockableConfirmation';

export default function Stockables({
    stockables,
}: PageProps<Paginated<Stockable>>) {
    const [showAddStockModal, setShowAddStockModal] =
        useState<Stockable | null>(null);
    const [
        showDeleteStockableConfirmation,
        setShowDeleteStockableConfirmation,
    ] = useState<Stockable | null>(null);

    const [search, setSearch] = useState('');

    return (
        <AuthenticatedLayout>
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

            <Card>
                <div className="mb-4 flex justify-between">
                    <div className="flex">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                router.get(route('stockables.index'))
                            }
                        >
                            <FilterX />
                        </Button>
                        <TextInput
                            id="search"
                            name="search"
                            className="h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onSearch(search, 'stockables.index')}
                        >
                            <Search />
                        </Button>
                    </div>

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
                                        variant={'secondary'}
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
            </Card>
        </AuthenticatedLayout>
    );
}
