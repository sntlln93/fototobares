import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn, formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface DraftRow {
    id: number;
    photo_number: number | null;
    child_name?: string;
    client_name?: string;
    client_phone?: string;
    attended_photo_session?: boolean;
    total_price: number;
    payment_plan: number;
    due_date: string;
    classroom: Classroom & { school?: School };
    created_at: string;
}

export default function DraftsIndex({
    drafts,
}: PageProps<{
    drafts: Paginated<DraftRow>;
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pedidos',
            href: route('orders.index'),
        },
        {
            title: 'Borradores',
            href: route('drafts.index'),
        },
    ];

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este borrador?')) {
            router.delete(route('drafts.destroy', { draft: id }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borradores de Pedidos" />

            <section className="px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            <FileText className="h-8 w-8" />
                            Borradores de Pedidos
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Gestiona tus borradores de pedidos para niños
                            fotografiados
                        </p>
                    </div>
                    <Link
                        href={route('orders.create')}
                        className={cn(
                            buttonVariants({
                                size: 'lg',
                            }),
                        )}
                    >
                        <Plus />
                        Nuevo Pedido
                    </Link>
                </div>
            </section>

            <section className="p-6">
                {drafts.data.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-25">N°</TableHead>
                                <TableHead>Nombre Niño</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Escuela (Aula)</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Cuotas</TableHead>
                                <TableHead>Sesión de fotos</TableHead>
                                <TableHead>Creado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drafts.data.map((draft) => (
                                <TableRow key={draft.id}>
                                    <TableCell className="font-medium">
                                        {draft.photo_number ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {draft.child_name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {draft.client_name || 'Sin especificar'}
                                    </TableCell>
                                    <TableCell>
                                        {draft.classroom.school
                                            ? `${draft.classroom.school.name} (${draft.classroom.name})`
                                            : draft.classroom.name}
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(draft.total_price)}
                                    </TableCell>
                                    <TableCell>{draft.payment_plan}</TableCell>
                                    <TableCell>
                                        {draft.attended_photo_session === true
                                            ? '✓ Sí'
                                            : draft.attended_photo_session ===
                                                false
                                              ? '✗ No'
                                              : 'Sin especificar'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            draft.created_at,
                                        ).toLocaleDateString('es-ES')}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link
                                            href={route('orders.create', {
                                                draft: draft.id,
                                            })}
                                            as="button"
                                            className={buttonVariants({
                                                size: 'sm',
                                                variant: 'outline',
                                            })}
                                        >
                                            Ver
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(draft.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>No hay borradores</CardTitle>
                            <CardDescription>
                                Los borradores que crees se mostrarán aquí
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </AppLayout>
    );
}
