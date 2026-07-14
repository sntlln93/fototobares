import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ListOrdered } from 'lucide-react';
import { ProductCard } from './components/product-card';
import { ProductStagesRow, StockableOption } from './hooks/use-status-actions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Etapas de producción',
        href: route('production-statuses.index'),
    },
];

export default function ProductionStatusesIndex({
    products,
    stockables,
}: PageProps<{
    products: ProductStagesRow[];
    stockables: StockableOption[];
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Etapas de producción" />

            <section className="px-6 pt-6">
                <h1 className="flex items-center gap-2 text-3xl font-bold">
                    <ListOrdered className="h-8 w-8" />
                    Etapas de producción
                </h1>
                <p className="mt-1 text-gray-500">
                    Cada producto tiene su propia cadena de etapas. Colgá de
                    cada etapa los insumos que mueve (con su cantidad): se
                    restan o se suman al stock cuando el producto llega a esa
                    etapa.
                </p>
            </section>

            <section className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        stockables={stockables}
                    />
                ))}
            </section>
        </AppLayout>
    );
}
