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

export default function DraftsIndex({
    drafts,
}: PageProps<{
    drafts: Paginated<{
        id: number;
        child_name?: string;
        client_name?: string;
        client_phone?: string;
        attended_photo_session?: boolean;
        total_price: number;
        payment_plan: number;
        due_date: string;
        classroom: Classroom & { school: School };
        created_at: string;
    }>;
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
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Nombre Niño</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Escuela (Aula)</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Cuotas</TableHead>
                                <TableHead>Fotos</TableHead>
                                <TableHead>Creado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drafts.data.map((draft) => (
                                <TableRow key={draft.id}>
                                    <TableCell className="font-medium">
                                        {draft.id}
                                    </TableCell>
                                    <TableCell>
                                        {draft.child_name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {draft.client_name || 'Sin especificar'}
                                    </TableCell>
                                    <TableCell>
                                        {draft.classroom.school.name} (
                                        {draft.classroom.name})
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(draft.total_price)}
                                    </TableCell>
                                    <TableCell>{draft.payment_plan}</TableCell>
                                    <TableCell>
                                        {draft.attended_photo_session
                                            ? '✓ Sí'
                                            : '✗ No'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            draft.created_at,
                                        ).toLocaleDateString('es-ES')}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            Ver
                                        </Button>
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
