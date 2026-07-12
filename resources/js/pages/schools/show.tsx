import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClassroomModals } from './components/classroom-modals';
import { ClassroomsTable } from './components/classrooms-table';
import { SchoolInfoCard } from './components/school-info-card';
import { SchoolShowData, useSchoolShow } from './hooks/use-school-show';

export default function School({
    school,
}: PageProps<{
    school: {
        data: SchoolShowData;
    };
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

            <ClassroomsTable school={school.data} controller={controller} />
        </AppLayout>
    );
}
