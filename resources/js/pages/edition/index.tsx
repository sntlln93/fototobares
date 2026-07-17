import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AssignableEditor,
    PhotoProduct,
} from '@/features/editor-assignment/BulkAssignEditorDialog';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClassroomTable, EditionSchool } from './components/classroom-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edición',
        href: route('edition.index'),
    },
];

export default function Edition({
    schools,
    canManage,
    editors,
    photoProducts,
}: PageProps<{
    schools: EditionSchool[];
    canManage: boolean;
    editors: AssignableEditor[];
    photoProducts: PhotoProduct[];
}>) {
    const hasRows = schools.some((school) =>
        school.classrooms.some((classroom) => classroom.rows.length > 0),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edición" />

            <section className="flex flex-col gap-8 p-4 md:p-6">
                {!hasRows ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Nada para editar</CardTitle>
                            <CardDescription>
                                No hay fotos pendientes de edición por el
                                momento.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    schools.map((school) => (
                        <div key={school.id} className="flex flex-col gap-4">
                            <h2 className="text-xl font-semibold">
                                {school.name}
                            </h2>
                            {school.classrooms.map((classroom) => (
                                <ClassroomTable
                                    key={classroom.id}
                                    classroom={classroom}
                                    canManage={canManage}
                                    editors={editors}
                                    photoProducts={photoProducts}
                                />
                            ))}
                        </div>
                    ))
                )}
            </section>
        </AppLayout>
    );
}
