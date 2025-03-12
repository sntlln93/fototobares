import { PaginationNav } from '@/components/paginationNav';
import { Badge } from '@/components/ui/badge';
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
import { formatPrice, getColorEs } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteProductConfirmation } from './partials/delete-confirmation';
import { ProductDesign } from './partials/product-design';
import { ProductIcon } from './partials/product-icon';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: route('products.index'),
    },
];

export default function Products({ products }: PageProps<Paginated<Product>>) {
    const [deleteableProduct, setDeleteableProduct] = useState<Product | null>(
        null,
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            {deleteableProduct && (
                <DeleteProductConfirmation
                    product={deleteableProduct}
                    show={Boolean(deleteableProduct)}
                    onClose={() => setDeleteableProduct(null)}
                />
            )}

            <section className="p-6">
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
                                    Medidas
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Diseño
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Fondos
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Colores
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
                                <TableCell className="flex gap-2">
                                    <ProductIcon
                                        type={product.product_type_id}
                                    />
                                    {product.name}
                                </TableCell>
                                <TableCell>
                                    {formatPrice(product.unit_price)}
                                </TableCell>
                                <TableCell>{product.max_payments}</TableCell>
                                <TableCell>
                                    {product.variants?.dimentions}
                                </TableCell>
                                <TableCell>
                                    {product.variants && (
                                        <ProductDesign
                                            variants={product.variants}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {product.variants?.backgrounds?.length >
                                        0 &&
                                        product.variants.backgrounds.map(
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
                                    {product.variants?.colors?.length > 0 &&
                                        product.variants.colors.map((color) => (
                                            <Badge
                                                variant="secondary"
                                                key={color}
                                            >
                                                {getColorEs(color)}
                                            </Badge>
                                        ))}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Link
                                        className={buttonVariants({
                                            variant: 'warning',
                                            size: 'sm',
                                        })}
                                        href={route('products.edit', {
                                            product: product.id,
                                        })}
                                    >
                                        <Edit2 />
                                    </Link>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() =>
                                            setDeleteableProduct(product)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={products.meta.links} />
            </section>
        </AppLayout>
    );
}
