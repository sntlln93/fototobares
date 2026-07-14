import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, ShoppingCart } from 'lucide-react';
import { StudentsTable } from './components/students-table';

export default function ClassroomShow({
    classroom,
    orders,
    filters,
}: PageProps<{
    classroom: Classroom & { teacher?: Teacher; school: School };
    orders: Paginated<Order>;
    filters: { search: string | null };
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
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Link
                            href={route('orders.index', {
                                classroom_id: classroom.id,
                            })}
                            className={cn(
                                buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                }),
                            )}
                        >
                            <ShoppingCart />
                            Ver pedidos
                        </Link>
                        <Link
                            href={route('schools.show', {
                                school: classroom.school.id,
                            })}
                            className={cn(
                                buttonVariants({
                                    size: 'sm',
                                    variant: 'outline',
                                }),
                            )}
                        >
                            <ArrowLeft />
                        </Link>
                    </div>
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

                <div className="mb-4">
                    <Searchbar
                        indexRoute="classrooms.show"
                        routeParams={{ classroom: classroom.id }}
                        term={filters.search}
                        placeholder="N°, nombre o teléfono"
                    />
                </div>

                {orders.data.length > 0 ? (
                    <StudentsTable
                        orders={orders.data}
                        search={filters.search}
                    />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardDescription className="text-center">
                                {filters.search
                                    ? 'Ningún alumno coincide con la búsqueda'
                                    : 'No hay alumnos registrados en este curso'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </AppLayout>
    );
}
