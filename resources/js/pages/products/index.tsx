import { Card } from '@/components/card';
import { NavLink } from '@/components/navLink';
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
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { onSort } from '@/lib/services/filter';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    Diff,
    Edit2,
    Plus,
    RectangleHorizontal,
    RectangleVertical,
    Trash,
    User,
    Users,
} from 'lucide-react';
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
                            Agregar producto
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
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Cuotas máximas
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Diseño
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Colores
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Fondos
                                </div>
                            </TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                    {product.id}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.unit_price}</TableCell>
                                <TableCell>{product.max_payments}</TableCell>
                                <TableCell>
                                    <ProductDesign
                                        variants={product.variants}
                                    />
                                </TableCell>
                                <TableCell>
                                    {product.variants.backgrounds.map(
                                        (background) => (
                                            <Badge
                                                variant="secondary"
                                                key={background}
                                            >
                                                {background}
                                            </Badge>
                                        ),
                                    )}
                                </TableCell>
                                <TableCell>
                                    {product.variants.colors.map((color) => (
                                        <Badge variant="secondary" key={color}>
                                            {color}
                                        </Badge>
                                    ))}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size={'sm'}
                                        variant={'warning'}
                                        onClick={() =>
                                            router.visit(
                                                route('products.edit', {
                                                    product: product.id,
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
                                            setDeleteableProduct(product)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant={'secondary'}
                                        onClick={() =>
                                            setDeleteableProduct(product)
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

function ProductDesign({ variants }: { variants: Product['variants'] }) {
    return (
        <div className="flex gap-1">
            <span>
                {variants.photo_type === 'individual' ? <User /> : <Users />}
            </span>
            <span>
                {variants.orientation === 'vertical' ? (
                    <RectangleVertical />
                ) : (
                    <RectangleHorizontal />
                )}
            </span>
            <span>{variants.dimensions}</span>
        </div>
    );
}
