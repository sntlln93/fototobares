import { Button } from '@/components/ui/button';
import { useSelection } from '@/hooks/use-selection';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import {
    SchoolWithClassrooms,
    StickerFilters,
    StickerIndexFilters,
} from './components/sticker-filters';
import {
    StickerOrderSummary,
    StickerOrdersTable,
} from './components/sticker-orders-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Etiquetas',
        href: route('stickers.index'),
    },
];

export default function Stickers({
    orders,
    schools,
    filters,
}: PageProps<{
    orders: StickerOrderSummary[];
    schools: SchoolWithClassrooms[];
    filters: StickerIndexFilters;
}>) {
    const { selected, toggle } = useSelection();

    const generate = () => {
        if (selected.length === 0) {
            toast.error('Seleccioná al menos un pedido');
            return;
        }

        const params = new URLSearchParams();
        selected.forEach((id) => params.append('ids[]', String(id)));

        window.open(
            `${route('stickers.print')}?${params.toString()}`,
            '_blank',
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Etiquetas" />

            <section className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <StickerFilters schools={schools} filters={filters} />
                    <Button onClick={generate}>
                        <Printer />
                        Generar stickers ({selected.length})
                    </Button>
                </div>

                <StickerOrdersTable
                    orders={orders}
                    selected={selected}
                    onToggle={toggle}
                />
            </section>
        </AppLayout>
    );
}
