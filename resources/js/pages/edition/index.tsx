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
import { EditionFilters } from './components/edition-filters';
import { useEditionFilters } from './hooks/use-edition-filters';

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
        school.classrooms.some((classroom) =>
            classroom.photoProductGroups.some((group) => group.rows.length > 0),
        ),
    );

    const filters = useEditionFilters(schools, canManage);
    const hasFilteredRows = filters.filteredSchools.some((school) =>
        school.classrooms.some((classroom) =>
            classroom.photoProductGroups.some((group) => group.rows.length > 0),
        ),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edición" />

            <section className="flex flex-col gap-8 p-4 md:p-6">
                {hasRows && (
                    <EditionFilters
                        canManage={canManage}
                        search={filters.search}
                        onSearchChange={filters.setSearch}
                        schoolId={filters.schoolId}
                        onSchoolChange={filters.setSchoolId}
                        classroomId={filters.classroomId}
                        onClassroomChange={filters.setClassroomId}
                        editorId={filters.editorId}
                        onEditorChange={filters.setEditorId}
                        productName={filters.productName}
                        onProductChange={filters.setProductName}
                        schoolOptions={filters.schoolOptions}
                        classroomOptions={filters.classroomOptions}
                        editorOptions={filters.editorOptions}
                        productOptions={filters.productOptions}
                    />
                )}

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
                ) : !hasFilteredRows ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Sin resultados</CardTitle>
                            <CardDescription>
                                Ninguna fila coincide con los filtros aplicados.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    filters.filteredSchools.map((school) => (
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
