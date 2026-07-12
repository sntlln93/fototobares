import { PaginationNav } from '@/components/paginationNav';
import { Button } from '@/components/ui/button';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { History, Plus } from 'lucide-react';
import { useState } from 'react';
import { AlterStockForm } from './components/alter-stock-form';
import { DeleteStockableConfirmation } from './components/delete-confirmation';
import { StockablesTable } from './components/stockables-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Stockeables',
        href: '/stockables',
    },
];

export default function Stockables({
    stockables,
}: PageProps<{ stockables: Paginated<Stockable & { products: Product[] }> }>) {
    const [showAddStockModal, setShowAddStockModal] =
        useState<Stockable | null>(null);
    const [
        showDeleteStockableConfirmation,
        setShowDeleteStockableConfirmation,
    ] = useState<Stockable | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock" />
            {showAddStockModal ? (
                <AlterStockForm
                    stockable={showAddStockModal}
                    show={Boolean(showAddStockModal)}
                    onClose={() => setShowAddStockModal(null)}
                />
            ) : undefined}

            {showDeleteStockableConfirmation ? (
                <DeleteStockableConfirmation
                    stockable={showDeleteStockableConfirmation}
                    show={Boolean(showDeleteStockableConfirmation)}
                    onClose={() => setShowDeleteStockableConfirmation(null)}
                />
            ) : undefined}

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="stockables.index" />

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('stock-movements.index')}>
                                <History />
                                <span className="sr-only md:inline-block">
                                    Movimientos
                                </span>
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('stockables.create')}>
                                <Plus />
                                <span className="sr-only md:inline-block">
                                    Agregar stockeable
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <StockablesTable
                    stockables={stockables.data}
                    onDelete={setShowDeleteStockableConfirmation}
                    onAlterStock={setShowAddStockModal}
                />

                <PaginationNav links={stockables.meta.links} />
            </section>
        </AppLayout>
    );
}
