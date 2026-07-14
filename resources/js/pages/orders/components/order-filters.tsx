import { Button, buttonVariants } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Searchbar } from '@/features/searchbar';
import { onFilter } from '@/lib/services/filter';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { FileText, GraduationCap, School as SchoolIcon } from 'lucide-react';
import { useState } from 'react';

export interface OrderIndexFilters {
    search: string | null;
    school_id: number | null;
    classroom_id: number | null;
}

export type SchoolWithClassrooms = School & { classrooms: Classroom[] };

export function OrderFilters({
    schools,
    filters,
}: {
    schools: SchoolWithClassrooms[];
    filters: OrderIndexFilters;
}) {
    const [schoolOpen, setSchoolOpen] = useState(false);
    const [classroomOpen, setClassroomOpen] = useState(false);

    // A classroom implies its school, so the school combobox also reflects
    // visits that only carried classroom_id (the "Ver pedidos" buttons).
    const selectedSchool =
        schools.find((school) => school.id === filters.school_id) ??
        schools.find((school) =>
            school.classrooms.some(
                (classroom) => classroom.id === filters.classroom_id,
            ),
        );

    const selectedClassroom = selectedSchool?.classrooms.find(
        (classroom) => classroom.id === filters.classroom_id,
    );

    const classroomItems = selectedSchool
        ? selectedSchool.classrooms.map((classroom) => ({
              label: classroom.name,
              value: classroom.id,
          }))
        : schools.flatMap((school) =>
              school.classrooms.map((classroom) => ({
                  label: `${school.name} — ${classroom.name}`,
                  value: classroom.id,
              })),
          );

    return (
        <div className="mb-4 flex flex-wrap gap-4">
            <Searchbar
                indexRoute="orders.index"
                term={filters.search}
                placeholder="N°, nombre o teléfono"
            />
            <Combobox
                items={schools.map((school) => ({
                    label: school.name,
                    value: school.id,
                }))}
                action={(value) =>
                    // Changing school invalidates any classroom filter
                    onFilter(
                        { school_id: value, classroom_id: null },
                        'orders.index',
                    )
                }
                open={schoolOpen}
                setOpen={setSchoolOpen}
                placeholder="Buscar escuela"
            >
                <Button variant="secondary" role="combobox">
                    {selectedSchool?.name ?? 'Filtrar por escuela'}
                    <SchoolIcon />
                </Button>
            </Combobox>
            <Combobox
                items={classroomItems}
                action={(value) =>
                    onFilter({ classroom_id: value }, 'orders.index')
                }
                open={classroomOpen}
                setOpen={setClassroomOpen}
                placeholder="Buscar curso"
            >
                <Button variant="secondary" role="combobox">
                    {selectedClassroom?.name ?? 'Filtrar por curso'}
                    <GraduationCap />
                </Button>
            </Combobox>
            <Link
                href={route('drafts.index')}
                className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'ml-auto',
                )}
            >
                <FileText />
                Borradores
            </Link>
        </div>
    );
}
