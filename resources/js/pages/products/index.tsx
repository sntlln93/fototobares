import { Card } from '@/components/card';
import { NavLink } from '@/components/navLink';
import { PaginationNav } from '@/components/paginationNav';
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
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { onSort } from '@/lib/services/filter';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Diff, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteProductConfirmation } from './partials/delete-confirmation';

const routeables = [
    { name: 'Productos', route: 'products.index' },
    { name: 'Combos', route: 'products.index' },
] as const;

const ProductNavigation = () => {
    return (
        <nav className="flex gap-2">
            {routeables.map((routeable) => (
                <NavLink
                    key={routeable.name}
                    href={route(routeable.route)}
                    active={route().current(routeable.route)}
                >
                    {routeable.name}
                </NavLink>
            ))}
        </nav>
    );
};

export default function Stockables({
    products,
}: PageProps<Paginated<Product>>) {
    const [deleteableProduct, setDeleteableProduct] = useState<Product | null>(
        null,
    );

    return (
        <AuthenticatedLayout header={<ProductNavigation />}>
            <Head title="Stock" />

            {deleteableProduct && (
                <DeleteProductConfirmation
                    product={deleteableProduct}
                    show={Boolean(deleteableProduct)}
                    onClose={() => setDeleteableProduct(null)}
                />
            )}

            <Card>
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="products.index" />

                    <Button asChild>
                        <Link href={route('products.create')}>
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
                                    Stockeable
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('quantity', 'products.index')
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
                        {products.data.map((stockable) => (
                            <TableRow key={stockable.id}>
                                <TableCell className="font-medium">
                                    {stockable.id}
                                </TableCell>
                                <TableCell>{stockable.name}</TableCell>
                                <TableCell>{stockable.name}</TableCell>
                                <TableCell>{stockable.name}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size={'sm'}
                                        variant={'warning'}
                                        onClick={() =>
                                            router.visit(
                                                route('products.edit', {
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
                                            setDeleteableProduct(stockable)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant={'secondary'}
                                        onClick={() =>
                                            setDeleteableProduct(stockable)
                                        }
                                    >
                                        <Diff />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={products.meta.links} />
            </Card>
        </AuthenticatedLayout>
    );
}
