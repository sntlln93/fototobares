import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import {
    ProductGroup,
    TrackingDetail,
    TrackingProduct,
} from './components/product-group';
import { Filters, TrackingFilters } from './components/tracking-filters';
import { useSelection } from './hooks/use-selection';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seguimiento',
        href: route('tracking.index'),
    },
];

export default function Tracking({
    details,
    products,
    productTypes,
    schools,
    filters,
}: PageProps<{
    details: TrackingDetail[];
    products: TrackingProduct[];
    productTypes: ProductType[];
    schools: Array<{ id: number; name: string }>;
    filters: Filters;
}>) {
    const { selected, toggle, toggleGroupItems, clear } = useSelection();

    const groups = useMemo(() => {
        return products
            .map((product) => ({
                product,
                items: details.filter(
                    (detail) => detail.product_id === product.id,
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [details, products]);

    const applyFilters = (
        overrides: Partial<Filters> & { search?: string },
    ) => {
        const params: Record<string, string> = {};
        const next = { ...filters, ...overrides };

        if (next.search) params.search = next.search;
        if (next.school_id) params.school_id = String(next.school_id);
        if (next.product_type_id)
            params.product_type_id = String(next.product_type_id);
        if (next.production_status_id)
            params.production_status_id = String(next.production_status_id);

        router.get(route('tracking.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyStatus = (
        statusId: number,
        detailIds: number[],
        statusName?: string,
    ) => {
        if (detailIds.length === 0) {
            toast.error('Seleccioná al menos un producto');
            return;
        }

        router.post(
            route('tracking.batch'),
            {
                detail_ids: detailIds,
                production_status_id: statusId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    clear();
                    toast.success(
                        statusName
                            ? `Estado actualizado a "${statusName}"`
                            : 'Estado actualizado',
                    );
                },
                onError: (errors) => {
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo actualizar el estado',
                    );
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimiento" />

            <section className="flex flex-col gap-6 p-4 md:p-6">
                <TrackingFilters
                    filters={filters}
                    schools={schools}
                    productTypes={productTypes}
                    onApply={applyFilters}
                />

                {groups.length === 0 ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Nada en producción</CardTitle>
                            <CardDescription>
                                No hay productos pendientes de fabricación con
                                los filtros actuales.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    groups.map(({ product, items }) => (
                        <ProductGroup
                            key={product.id}
                            product={product}
                            items={items}
                            selected={selected}
                            onToggle={toggle}
                            onToggleGroup={() =>
                                toggleGroupItems(items.map((item) => item.id))
                            }
                            onApplyStatus={applyStatus}
                        />
                    ))
                )}
            </section>
        </AppLayout>
    );
}
