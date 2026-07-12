import { useState } from 'react';

export type SchoolShowData = School & {
    user: User;
    principal?: Principal;
    classrooms: Array<Classroom & { teacher: Teacher }>;
    full_address?: string;
};

export function useSchoolShow() {
    const [deleteableClassroom, setDeleteableClassroom] =
        useState<Classroom | null>(null);

    const [editableClassroom, setEditableClassroom] =
        useState<Classroom | null>(null);

    const [showAddClassroom, setShowAddClassroom] = useState<School | null>(
        null,
    );

    return {
        deleteableClassroom,
        setDeleteableClassroom,
        editableClassroom,
        setEditableClassroom,
        showAddClassroom,
        setShowAddClassroom,
    };
}

export type SchoolShowController = ReturnType<typeof useSchoolShow>;
