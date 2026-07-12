import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ComboForm } from './components/combo-form';
import { useComboForm } from './hooks/use-combo-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Combos',
        href: route('combos.index'),
    },
    {
        title: 'Nuevo combo',
        href: route('combos.create'),
    },
];

export default function CreateCombo({
    products,
}: PageProps<{ products: Product[] }>) {
    const form = useComboForm({
        products,
        initialData: {
            name: '',
            suggested_price: '0',
            suggested_max_payments: '0',
            products: [],
        },
        onSubmit: (form) => form.post(route('combos.store')),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combos" />

            <ComboForm
                form={form}
                products={products}
                submitLabel="Agregar combo"
            />
        </AppLayout>
    );
}
