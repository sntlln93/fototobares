import { Button } from '@/components/ui/button';
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
import { DeleteClassroomConfirmation } from '@/pages/classrooms/delete-confirmation';
import { EditClassroom } from '@/pages/classrooms/edit';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { CreateClassroom } from '../classrooms/create';

const sort = (sortBy: 'name' | 'id') => {
    return onSort(sortBy, 'classrooms.index');
};

export default function School({ school }: PageProps<{ school: School }>) {
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
            href: route('schools.show', { school: school.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${school.name} - Cursos`} />

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

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="classrooms.index" />

                    <Button onClick={() => setShowAddClassroom(school)}>
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
                        {school.classrooms.map((classroom) => (
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
