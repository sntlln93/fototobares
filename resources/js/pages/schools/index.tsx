import { PaginationNav } from '@/components/paginationNav';
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
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteSchoolConfirmation } from './partials/delete-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Escuelas',
        href: '/schools',
    },
];

const sort = (sortBy: 'name' | 'id') => {
    return onSort(sortBy, 'schools.index');
};

export default function Schools({ schools }: PageProps<Paginated<School>>) {
    const [deleteableSchool, setDeleteableSchool] = useState<School | null>(
        null,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Escuelas" />

            {deleteableSchool && (
                <DeleteSchoolConfirmation
                    school={deleteableSchool}
                    show={Boolean(deleteableSchool)}
                    onClose={() => setDeleteableSchool(null)}
                />
            )}

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="schools.index" />

                    <Button asChild>
                        <Link href={route('schools.create')}>
                            <Plus />
                            Nueva escuela
                        </Link>
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
                            <TableHead>Nivel</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Director/a
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Dirección (localidad)
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Aulas
                                </div>
                            </TableHead>

                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.data.map((school) => (
                            <TableRow key={school.id}>
                                <TableCell className="font-medium">
                                    {school.id}
                                </TableCell>
                                <TableCell>{school.name}</TableCell>
                                <TableCell>{school.level}</TableCell>
                                <TableCell>{school.principal.name}</TableCell>
                                <TableCell>{school.full_address}</TableCell>
                                <TableCell>
                                    {school.classrooms.length} aulas
                                </TableCell>

                                <TableCell className="flex gap-2">
                                    <Button
                                        size={'sm'}
                                        variant={'warning'}
                                        asChild
                                    >
                                        <Link
                                            href={route('schools.edit', {
                                                school: school.id,
                                            })}
                                        >
                                            <Edit2 />
                                        </Link>
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() =>
                                            setDeleteableSchool(school)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={schools.meta.links} />
            </section>
        </AppLayout>
    );
}
