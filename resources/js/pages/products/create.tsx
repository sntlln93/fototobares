import AppLayout from '@/layouts/app-layout';
import { getColorEs } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ProductForm } from './components/product-form';
import { useProductForm } from './hooks/use-product-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: route('products.index'),
    },
    {
        title: 'Nuevo producto',
        href: route('products.create'),
    },
];

export default function CreateProduct({
    product_types,
}: PageProps<{ product_types: ProductType[] }>) {
    const form = useProductForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo producto" />

            <ProductForm
                form={form}
                product_types={product_types}
                typeSelectProps={{ defaultValue: 'mural' }}
                submitLabel="Agregar producto"
                renderColorLabel={getColorEs}
            />
        </AppLayout>
    );
}
