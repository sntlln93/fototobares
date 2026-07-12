import { Button, buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Searchbar } from '@/features/searchbar';
import { onSort } from '@/lib/services/filter';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Plus, Trash } from 'lucide-react';
import {
    type SchoolShowController,
    type SchoolShowData,
} from '../hooks/use-school-show';

const sort = (sortBy: 'name' | 'id') => {
    return onSort(sortBy, 'classrooms.index');
};

export function ClassroomsTable({
    school,
    controller,
}: {
    school: SchoolShowData;
    controller: SchoolShowController;
}) {
    const {
        setShowAddClassroom,
        setEditableClassroom,
        setDeleteableClassroom,
    } = controller;

    return (
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
                            <div className="flex items-center gap-2">Niños</div>
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
                            <TableCell>
                                <Link
                                    href={route('classrooms.show', {
                                        classroom: classroom.id,
                                    })}
                                    className={cn(
                                        buttonVariants({
                                            size: 'sm',
                                            variant: 'outline',
                                        }),
                                    )}
                                >
                                    Ver alumnos
                                </Link>
                            </TableCell>

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
    );
}
