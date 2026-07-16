import {
    AssignableEditor,
    BulkAssignEditorDialog,
    PhotoProduct,
} from '@/features/editor-assignment/BulkAssignEditorDialog';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClassroomModals } from './components/classroom-modals';
import { ClassroomsTable } from './components/classrooms-table';
import { SchoolInfoCard } from './components/school-info-card';
import { SchoolShowData, useSchoolShow } from './hooks/use-school-show';

export default function School({
    school,
    assignableEditors,
    photoProducts,
}: PageProps<{
    school: {
        data: SchoolShowData;
    };
    assignableEditors: AssignableEditor[];
    photoProducts: PhotoProduct[];
}>) {
    const controller = useSchoolShow();

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

            <ClassroomModals controller={controller} />

            <SchoolInfoCard school={school.data} />

            <div className="flex justify-end px-6 pt-4">
                <BulkAssignEditorDialog
                    assignableEditors={assignableEditors}
                    photoProducts={photoProducts}
                    schoolId={school.data.id}
                />
            </div>

            <ClassroomsTable school={school.data} controller={controller} />
        </AppLayout>
    );
}
