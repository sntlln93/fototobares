import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { onFilter } from '@/lib/services/filter';
import { GraduationCap, School as SchoolIcon } from 'lucide-react';
import { useState } from 'react';

export interface StickerIndexFilters {
    school_id: number | null;
    classroom_id: number | null;
}

export type SchoolWithClassrooms = School & { classrooms: Classroom[] };

export function StickerFilters({
    schools,
    filters,
}: {
    schools: SchoolWithClassrooms[];
    filters: StickerIndexFilters;
}) {
    const [schoolOpen, setSchoolOpen] = useState(false);
    const [classroomOpen, setClassroomOpen] = useState(false);

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
            <Combobox
                items={schools.map((school) => ({
                    label: school.name,
                    value: school.id,
                }))}
                action={(value) =>
                    // Changing school invalidates any classroom filter
                    onFilter(
                        { school_id: value, classroom_id: null },
                        'stickers.index',
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
                    onFilter({ classroom_id: value }, 'stickers.index')
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
        </div>
    );
}
