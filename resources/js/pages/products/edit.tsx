import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ProductForm } from './components/product-form';
import { useProductForm } from './hooks/use-product-form';

export default function EditProduct({
    product,
    product_types,
}: PageProps<{ product: Product; product_types: ProductType[] }>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Productos',
            href: route('products.index'),
        },
        {
            title: 'Editar producto',
            href: route('products.edit', { product: product.id }),
        },
    ];

    const form = useProductForm(product);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar producto" />

            <ProductForm
                form={form}
                product_types={product_types}
                typeSelectProps={{ value: String(form.data.product_type_id) }}
                submitLabel="Modificar producto"
            />
        </AppLayout>
    );
}
