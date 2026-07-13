import { Accordion } from '@/components/ui/accordion';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AddDetail } from './components/add-detail';
import { ClientStep } from './components/client-step';
import { OrderStep } from './components/order-step';
import { ProductsStep } from './components/products-step';
import { SchoolStep } from './components/school-step';
import { DraftProp } from './form-state';
import { SchoolLevel, useCreateOrderForm } from './hooks/use-create-order-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
    {
        title: 'Nuevo pedido',
        href: route('orders.create'),
    },
];

export default function CreateOrder({
    schoolLevels,
    combos,
    schools,
    products,
    draft,
}: PageProps<{
    schoolLevels: SchoolLevel[];
    combos: Array<Combo & { products: Product[] }>;
    schools: Array<School & { classrooms: Classroom[] }>;
    products: Product[];
    draft?: DraftProp | null;
}>) {
    const form = useCreateOrderForm({ products, combos, schools, draft });
    const {
        openAddModal,
        editingIndex,
        data,
        setProductsOrder,
        setOpenAddModal,
        setEditingIndex,
    } = form;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo pedido" />
            {openAddModal ? (
                <AddDetail
                    addProducts={setProductsOrder}
                    products={openAddModal}
                    initialValues={
                        editingIndex !== null
                            ? [data.order_details[editingIndex]]
                            : undefined
                    }
                    show={Boolean(openAddModal)}
                    onClose={() => {
                        setOpenAddModal(null);
                        setEditingIndex(null);
                    }}
                />
            ) : undefined}

            <form onSubmit={form.submit} className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={form.accordionValue}
                >
                    <SchoolStep
                        form={form}
                        schools={schools}
                        schoolLevels={schoolLevels}
                    />
                    <ClientStep form={form} />
                    <ProductsStep
                        form={form}
                        products={products}
                        combos={combos}
                    />
                    <OrderStep form={form} />
                </Accordion>
            </form>
        </AppLayout>
    );
}
