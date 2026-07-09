import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { capitalize } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ListOrdered } from 'lucide-react';
import { useState } from 'react';
import { AddStatusForm } from './partials/add-status-form';
import { DeleteStatusConfirmation } from './partials/delete-confirmation';
import { StatusItem } from './partials/status-item';
import {
    ProductTypeRow,
    StatusRow,
    useStatusActions,
} from './partials/use-status-actions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Etapas de producción',
        href: route('production-statuses.index'),
    },
];

export default function ProductionStatusesIndex({
    productTypes,
}: PageProps<{ productTypes: ProductTypeRow[] }>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Etapas de producción" />

            <section className="px-6 pt-6">
                <h1 className="flex items-center gap-2 text-3xl font-bold">
                    <ListOrdered className="h-8 w-8" />
                    Etapas de producción
                </h1>
                <p className="mt-1 text-gray-500">
                    Agregá, renombrá o reordená las etapas de cada tipo de
                    producto. Los insumos se descuentan cuando un producto pasa
                    a la <strong>segunda</strong> etapa de su cadena.
                </p>
            </section>

            <section className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
                {productTypes.map((type) => (
                    <ProductTypeCard key={type.id} type={type} />
                ))}
            </section>
        </AppLayout>
    );
}

function ProductTypeCard({ type }: { type: ProductTypeRow }) {
    const { move, rename, add } = useStatusActions(type);
    const [deletableStatus, setDeletableStatus] = useState<StatusRow | null>(
        null,
    );

    return (
        <Card>
            {deletableStatus && (
                <DeleteStatusConfirmation
                    status={deletableStatus}
                    show={Boolean(deletableStatus)}
                    onClose={() => setDeletableStatus(null)}
                />
            )}

            <CardHeader>
                <CardTitle className="text-xl">
                    {capitalize(type.name)}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {type.statuses.map((status, index) => (
                    <StatusItem
                        key={status.id}
                        status={status}
                        isFirst={index === 0}
                        isLast={index === type.statuses.length - 1}
                        isOnly={type.statuses.length === 1}
                        onMoveUp={() => move(index, -1)}
                        onMoveDown={() => move(index, 1)}
                        onRename={(name, onSuccess) =>
                            rename(status.id, name, onSuccess)
                        }
                        onDelete={() => setDeletableStatus(status)}
                    />
                ))}

                <AddStatusForm onAdd={add} />
            </CardContent>
        </Card>
    );
}
