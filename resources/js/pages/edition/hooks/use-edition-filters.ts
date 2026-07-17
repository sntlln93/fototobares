import { useState } from 'react';
import { EditionRowData, EditionSchool } from '../components/classroom-table';

export interface FilterOption {
    id: number;
    name: string;
}

interface EditionFilterState {
    search: string;
    schoolId: number | null;
    classroomId: number | null;
    editorId: number | null;
    productName: string | null;
}

const DIACRITICS = /[̀-ͯ]/g;

/** Lowercase and strip accents, so "jose" matches "José" like the backend search. */
function normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(DIACRITICS, '');
}

function matchesSearch(row: EditionRowData, query: string): boolean {
    if (query === '') return true;

    const haystack = [
        row.photo_number ?? '',
        row.child_name ?? '',
        row.variant_search,
        row.diseno ?? '',
    ].join(' ');

    return normalize(haystack).includes(normalize(query));
}

function matchesRow(
    row: EditionRowData,
    schoolId: number,
    classroomId: number,
    filters: EditionFilterState,
    canManage: boolean,
): boolean {
    return (
        (filters.schoolId === null || filters.schoolId === schoolId) &&
        (filters.classroomId === null || filters.classroomId === classroomId) &&
        (!canManage ||
            filters.editorId === null ||
            row.editor?.id === filters.editorId) &&
        (filters.productName === null ||
            row.photo_size === filters.productName) &&
        matchesSearch(row, filters.search)
    );
}

function filterSchools(
    schools: EditionSchool[],
    filters: EditionFilterState,
    canManage: boolean,
): EditionSchool[] {
    return schools
        .map((school) => ({
            ...school,
            classrooms: school.classrooms
                .map((classroom) => ({
                    ...classroom,
                    rows: classroom.rows.filter((row) =>
                        matchesRow(
                            row,
                            school.id,
                            classroom.id,
                            filters,
                            canManage,
                        ),
                    ),
                }))
                .filter((classroom) => classroom.rows.length > 0),
        }))
        .filter((school) => school.classrooms.length > 0);
}

function dedupeById(options: FilterOption[]): FilterOption[] {
    return Array.from(new Map(options.map((o) => [o.id, o])).values());
}

/** Client-side search + dropdown filters for the edition board (#194). */
export function useEditionFilters(
    schools: EditionSchool[],
    canManage: boolean,
) {
    const [search, setSearch] = useState('');
    const [schoolId, setSchoolId] = useState<number | null>(null);
    const [classroomId, setClassroomId] = useState<number | null>(null);
    const [editorId, setEditorId] = useState<number | null>(null);
    const [productName, setProductName] = useState<string | null>(null);

    const schoolOptions = dedupeById(
        schools.map((school) => ({ id: school.id, name: school.name })),
    );

    const classroomOptions = dedupeById(
        schools
            .filter((school) => schoolId === null || school.id === schoolId)
            .flatMap((school) =>
                school.classrooms.map((c) => ({ id: c.id, name: c.name })),
            ),
    );

    const allRows = schools.flatMap((s) => s.classrooms.flatMap((c) => c.rows));

    const editorOptions = dedupeById(
        allRows
            .map((row) => row.editor)
            .filter((editor): editor is FilterOption => editor != null),
    );

    const productOptions = Array.from(
        new Set(
            allRows
                .map((row) => row.photo_size)
                .filter((size): size is string => size != null),
        ),
    ).sort();

    const filteredSchools = filterSchools(
        schools,
        { search, schoolId, classroomId, editorId, productName },
        canManage,
    );

    return {
        search,
        setSearch,
        schoolId,
        setSchoolId,
        classroomId,
        setClassroomId,
        editorId,
        setEditorId,
        productName,
        setProductName,
        schoolOptions,
        classroomOptions,
        editorOptions,
        productOptions,
        filteredSchools,
    };
}

export { matchesRow, matchesSearch, normalize };
