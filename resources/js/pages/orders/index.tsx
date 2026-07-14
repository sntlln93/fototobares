import { PaginationNav } from '@/components/paginationNav';
import { Button, buttonVariants } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, School } from 'lucide-react';
import { useState } from 'react';
import { DeleteOrderConfirmation } from './components/delete-confirmation';
import { OrdersTable } from './components/orders-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
];

export default function Orders({
    orders,
    schools,
    filters,
}: PageProps<{
    orders: Paginated<Order>;
    schools: School[];
    filters: { search: string | null };
}>) {
    const params = new URLSearchParams(window.location.search);

    const [comboDropdownOpen, setComboDropdownOpen] = useState(false);
    const [selectedSchool] = useState<number | null>(
        params.get('school_id') ? Number(params.get('school_id')!) : null,
    );
    const [deleteableOrder, setDeleteableOrder] = useState<Order | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            {deleteableOrder && (
                <DeleteOrderConfirmation
                    order={deleteableOrder}
                    show={Boolean(deleteableOrder)}
                    onClose={() => setDeleteableOrder(null)}
                />
            )}

            <section className="p-6">
                <div className="mb-4 flex flex-wrap gap-4">
                    <Searchbar
                        indexRoute="orders.index"
                        term={filters.search}
                        placeholder="N°, nombre o teléfono"
                    />
                    <Combobox
                        items={schools.map((school) => ({
                            label: school.name,
                            value: school.id,
                        }))}
                        action={(value) => {
                            params.set('school_id', value);
                            router.get(
                                `${route('orders.index')}?${params.toString()}`,
                            );
                        }}
                        open={comboDropdownOpen}
                        setOpen={setComboDropdownOpen}
                        placeholder="Buscar escuela"
                    >
                        <Button variant="secondary" role="combobox">
                            {selectedSchool
                                ? schools.find(
                                      (school) => school.id === selectedSchool,
                                  )?.name || 'Filtrar por escuela'
                                : 'Filtrar por escuela'}
                            <School />
                        </Button>
                    </Combobox>
                    <Link
                        href={route('drafts.index')}
                        className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'ml-auto',
                        )}
                    >
                        <FileText />
                        Borradores
                    </Link>
                </div>

                <OrdersTable
                    orders={orders.data}
                    search={filters.search}
                    onDelete={setDeleteableOrder}
                />

                <PaginationNav links={orders.meta.links} />
            </section>
        </AppLayout>
    );
}
