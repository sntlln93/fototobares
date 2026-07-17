import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EditionRowData, EditionSchool } from '../components/classroom-table';
import { useEditionFilters } from '../hooks/use-edition-filters';

const vale = { id: 1, name: 'Vale' };
const bruno = { id: 2, name: 'Bruno' };

function makeRow(overrides: Partial<EditionRowData>): EditionRowData {
    return {
        id: 0,
        order_id: 0,
        photo_size: null,
        diseno: null,
        child_name: null,
        photo_number: null,
        variant_search: '',
        editing_status: 'pendiente',
        note: null,
        allowed_targets: [],
        is_first_of_order: true,
        editor: null,
        ...overrides,
    };
}

// School A / 1ro A: two rows, distinct editors and products
const row1 = makeRow({
    id: 1,
    order_id: 100,
    photo_size: 'Foto 15x21',
    diseno: 'Individual',
    child_name: 'José Pérez',
    photo_number: 101,
    variant_search: 'Vertical Celeste',
    editor: vale,
});
const row2 = makeRow({
    id: 2,
    order_id: 101,
    photo_size: 'Foto 10x15',
    diseno: 'Grupal',
    child_name: 'Ana López',
    photo_number: 102,
    variant_search: 'Horizontal Blanco',
    editor: bruno,
});

// School A / 1ro B: one row, no editor assigned
const row3 = makeRow({
    id: 3,
    order_id: 102,
    photo_size: 'Foto 15x21',
    diseno: 'Individual',
    child_name: 'Niño Torres',
    photo_number: 103,
    variant_search: 'Vertical Blanco',
    editor: null,
});

// School B / 2do A: one row, editor reused from row1
const row4 = makeRow({
    id: 4,
    order_id: 103,
    photo_size: 'Foto 10x15',
    diseno: 'Individual',
    child_name: 'Luca Gómez',
    photo_number: 104,
    variant_search: 'Horizontal Celeste',
    editor: vale,
});

const schoolA: EditionSchool = {
    id: 1,
    name: 'Escuela A',
    classrooms: [
        { id: 10, name: '1ro A', rows: [row1, row2] },
        { id: 11, name: '1ro B', rows: [row3] },
    ],
};

const schoolB: EditionSchool = {
    id: 2,
    name: 'Escuela B',
    classrooms: [{ id: 20, name: '2do A', rows: [row4] }],
};

const schools: EditionSchool[] = [schoolA, schoolB];

describe('useEditionFilters', () => {
    it('keeps every school/classroom/row when no filter is applied', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        expect(result.current.filteredSchools).toEqual(schools);
    });

    it('filters by child_name substring, case-insensitively', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('lopez'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row2] }],
            },
        ]);
    });

    it('filters by photo_number', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('103'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 11, name: '1ro B', rows: [row3] }],
            },
        ]);
    });

    it('filters by a photo-variant value present in diseno', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('Grupal'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row2] }],
            },
        ]);
    });

    it('is accent-insensitive', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('nino'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 11, name: '1ro B', rows: [row3] }],
            },
        ]);
    });

    it('filters by schoolId', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSchoolId(2));

        expect(result.current.filteredSchools).toEqual([schoolB]);
    });

    it('filters by classroomId', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setClassroomId(11));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 11, name: '1ro B', rows: [row3] }],
            },
        ]);
    });

    it('filters by editorId when canManage is true', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setEditorId(1));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row1] }],
            },
            schoolB,
        ]);
    });

    it('ignores editorId when canManage is false', () => {
        const { result } = renderHook(() => useEditionFilters(schools, false));

        act(() => result.current.setEditorId(1));

        expect(result.current.filteredSchools).toEqual(schools);
    });

    it('filters by productName (photo_size)', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setProductName('Foto 10x15'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row2] }],
            },
            schoolB,
        ]);
    });

    it('applies two filters with AND semantics', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => {
            result.current.setSearch('Blanco');
            result.current.setProductName('Foto 10x15');
        });

        // "Blanco" alone also matches row3 (Vertical Blanco), but its
        // photo_size is Foto 15x21, so the productName filter excludes it
        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row2] }],
            },
        ]);
    });

    it('drops classrooms left empty and schools left without classrooms', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        // Only row2 was assigned to Bruno: classroom 1ro B (row3, no editor)
        // and every classroom in School B (row4, Vale) are filtered out,
        // so School B disappears entirely while School A keeps only 1ro A
        act(() => result.current.setEditorId(2));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [{ id: 10, name: '1ro A', rows: [row2] }],
            },
        ]);
    });

    it('exposes de-duplicated option lists, narrowing classrooms to the selected school', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        expect(result.current.schoolOptions).toEqual([
            { id: 1, name: 'Escuela A' },
            { id: 2, name: 'Escuela B' },
        ]);
        expect(result.current.classroomOptions).toEqual([
            { id: 10, name: '1ro A' },
            { id: 11, name: '1ro B' },
            { id: 20, name: '2do A' },
        ]);
        // Vale (id 1) appears on row1 and row4: de-duplicated to one entry
        expect(result.current.editorOptions).toEqual([
            { id: 1, name: 'Vale' },
            { id: 2, name: 'Bruno' },
        ]);
        // Foto 15x21 (row1, row3) and Foto 10x15 (row2, row4): de-duplicated
        expect(result.current.productOptions).toEqual([
            'Foto 10x15',
            'Foto 15x21',
        ]);

        act(() => result.current.setSchoolId(1));

        expect(result.current.classroomOptions).toEqual([
            { id: 10, name: '1ro A' },
            { id: 11, name: '1ro B' },
        ]);
    });
});
