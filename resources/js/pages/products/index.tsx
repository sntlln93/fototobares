import { PaginationNav } from '@/components/paginationNav';
import { Button } from '@/components/ui/button';
import { Table, TableBody } from '@/components/ui/table';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ProductRow } from './components/product-row';
import { ProductsTableHeader } from './components/products-table-header';
import { useProducts } from './hooks/use-products';
import { DeleteProductConfirmation } from './partials/delete-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: route('products.index'),
    },
];

export default function Products({
    products,
}: PageProps<{ products: Paginated<Product> }>) {
    const { deleteableProduct, setDeleteableProduct } = useProducts();

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
                    <ProductsTableHeader />
                    <TableBody>
                        {products.data.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                onDelete={setDeleteableProduct}
                            />
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={products.meta.links} />
            </section>
        </AppLayout>
    );
}
