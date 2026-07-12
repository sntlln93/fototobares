import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ComboForm } from './components/combo-form';
import { FormData } from './form';
import { useComboForm } from './hooks/use-combo-form';

export default function EditCombo({
    products,
    combo,
}: PageProps<{
    products: Product[];
    combo: { data: { id: number } & FormData };
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Combos',
            href: route('combos.index'),
        },
        {
            title: 'Editar combo',
            href: route('combos.edit', { combo: combo.data.id }),
        },
    ];

    const form = useComboForm({
        products,
        initialData: {
            name: combo.data.name,
            suggested_price: combo.data.suggested_price,
            suggested_max_payments: combo.data.suggested_max_payments,
            products: combo.data.products,
        },
        onSubmit: (form) =>
            form.put(route('combos.update', { combo: combo.data.id })),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combos" />

            <ComboForm
                form={form}
                products={products}
                submitLabel="Modificar combo"
            />
        </AppLayout>
    );
}
