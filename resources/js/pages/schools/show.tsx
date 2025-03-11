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
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { onSort } from '@/lib/services/filter';
import { cn } from '@/lib/utils';
import { DeleteClassroomConfirmation } from '@/pages/classrooms/delete-confirmation';
import { EditClassroom } from '@/pages/classrooms/edit';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpDown, Edit, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { CreateClassroom } from '../classrooms/create';

const sort = (sortBy: 'name' | 'id') => {
    return onSort(sortBy, 'classrooms.index');
};

export default function School({
    school,
}: PageProps<{
    school: {
        data: School & {
            user: User;
            principal?: Principal;
            classrooms: Array<Classroom & { teacher: Teacher }>;
            full_address?: string;
        };
    };
}>) {
    const [deleteableClassroom, setDeleteableClassroom] =
        useState<Classroom | null>(null);

    const [editableClassroom, setEditableClassroom] =
        useState<Classroom | null>(null);

    const [showAddClassroom, setShowAddClassroom] = useState<School | null>(
        null,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Escuelas',
            href: route('schools.index'),
        },
        {
            title: 'Cursos',
            href: route('schools.show', { school: school.data.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${school.data.name} - Cursos`} />

            {deleteableClassroom && (
                <DeleteClassroomConfirmation
                    classroom={deleteableClassroom}
                    show={Boolean(deleteableClassroom)}
                    onClose={() => setDeleteableClassroom(null)}
                />
            )}

            {editableClassroom && (
                <EditClassroom
                    classroom={editableClassroom}
                    show={Boolean(editableClassroom)}
                    onClose={() => setEditableClassroom(null)}
                />
            )}

            {showAddClassroom && (
                <CreateClassroom
                    school={showAddClassroom}
                    show={Boolean(showAddClassroom)}
                    onClose={() => setShowAddClassroom(null)}
                />
            )}

            <section className="px-6 pt-6">
                <Card className="relative max-w-[425px]">
                    <Link
                        href={route('schools.edit', {
                            school: school.data.id,
                        })}
                        className={cn(
                            'absolute right-4 top-4',
                            buttonVariants({
                                size: 'sm',
                                variant: 'warning',
                            }),
                        )}
                    >
                        <Edit />
                    </Link>
                    <CardHeader>
                        <CardDescription>
                            {school.data.user.name}
                        </CardDescription>
                        <CardTitle>
                            {school.data.level} {school.data.name}
                        </CardTitle>
                        {school.data.principal && (
                            <CardDescription>
                                {school.data.principal.name}
                            </CardDescription>
                        )}
                        <span>{school.data.full_address}</span>
                    </CardHeader>
                </Card>
            </section>

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="classrooms.index" />

                    <Button onClick={() => setShowAddClassroom(school.data)}>
                        <Plus />
                        Nuevo curso
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => sort('id')}>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    #
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => sort('name')}>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Nombre
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Maestro/a
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Niños
                                </div>
                            </TableHead>

                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {school.data.classrooms.map((classroom) => (
                            <TableRow key={classroom.id}>
                                <TableCell className="font-medium">
                                    {classroom.id}
                                </TableCell>
                                <TableCell>{classroom.name}</TableCell>
                                <TableCell>{classroom.teacher?.name}</TableCell>
                                <TableCell>aulas</TableCell>

                                <TableCell className="flex gap-2">
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() =>
                                            setEditableClassroom(classroom)
                                        }
                                    >
                                        <Edit2 />
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() =>
                                            setDeleteableClassroom(classroom)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </AppLayout>
    );
}
