import { buttonVariants } from '@/components/ui/button';
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
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImagePlus } from 'lucide-react';

export default function ClassroomShow({
    classroom,
    orders,
}: PageProps<{
    classroom: Classroom & { teacher?: Teacher; school: School };
    orders: Paginated<Order>;
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Escuelas',
            href: route('schools.index'),
        },
        {
            title: 'Cursos',
            href: route('schools.show', { school: classroom.school.id }),
        },
        {
            title: classroom.name,
            href: route('classrooms.show', { classroom: classroom.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${classroom.name} - Alumnos`} />

            <section className="px-6 pt-6">
                <Card className="relative max-w-106.25">
                    <Link
                        href={route('schools.show', {
                            school: classroom.school.id,
                        })}
                        className={cn(
                            'absolute top-4 right-4',
                            buttonVariants({
                                size: 'sm',
                                variant: 'outline',
                            }),
                        )}
                    >
                        <ArrowLeft />
                    </Link>
                    <CardHeader>
                        <CardDescription>
                            {classroom.school.name}
                        </CardDescription>
                        <CardTitle>{classroom.name}</CardTitle>
                        {classroom.teacher?.name && (
                            <CardDescription>
                                Maestro/a: {classroom.teacher.name}
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>
            </section>

            <section className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Alumnos ({orders.data.length})
                    </h2>
                    <Link
                        href={route('photos.index', {
                            classroom: classroom.id,
                        })}
                        className={cn(
                            buttonVariants({
                                size: 'sm',
                            }),
                            'gap-2',
                        )}
                    >
                        <ImagePlus className="h-4 w-4" />
                        Gestionar fotos
                    </Link>
                </div>

                {orders.data.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-25">#</TableHead>
                                <TableHead>Nombre del Niño</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Productos</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Cuotas</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {order.id}
                                    </TableCell>
                                    <TableCell>
                                        {order.child_name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {order.client.name || 'Sin especificar'}
                                    </TableCell>
                                    <TableCell>
                                        {order.client.phone || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {order.products.length}
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(order.total_price)}
                                    </TableCell>
                                    <TableCell>
                                        {order.payment_plan} (
                                        {formatPrice(
                                            order.total_price /
                                                order.payment_plan,
                                        )}
                                        )
                                    </TableCell>
                                    <TableCell>{order.due_date}</TableCell>
                                    <TableCell>
                                        <Link
                                            className={cn(
                                                buttonVariants({
                                                    size: 'sm',
                                                    variant: 'outline',
                                                }),
                                            )}
                                            href={route('orders.show', {
                                                order: order.id,
                                            })}
                                        >
                                            Ver
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardDescription className="text-center">
                                No hay alumnos registrados en este curso
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </AppLayout>
    );
}
