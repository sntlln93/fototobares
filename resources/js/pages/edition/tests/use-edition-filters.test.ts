import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    EditionClassroom,
    EditionPhotoProductGroup,
    EditionRowData,
    EditionSchool,
} from '../components/classroom-table';
import { useEditionFilters } from '../hooks/use-edition-filters';

const vale = { id: 1, name: 'Vale' };
const bruno = { id: 2, name: 'Bruno' };

function makeRow(overrides: Partial<EditionRowData>): EditionRowData {
    return {
        id: 0,
        order_id: 0,
        order_seq: 0,
        photo_size: null,
        variants: {},
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

function makeGroup(
    overrides: Partial<EditionPhotoProductGroup> & {
        rows: EditionRowData[];
    },
): EditionPhotoProductGroup {
    return {
        product_id: 0,
        product_name: null,
        variant_columns: [],
        ...overrides,
    };
}

function makeClassroom(
    overrides: Partial<EditionClassroom> & {
        photoProductGroups: EditionPhotoProductGroup[];
    },
): EditionClassroom {
    return {
        id: 0,
        name: '',
        order_count: 0,
        ...overrides,
    };
}

// School A / 1ro A: two rows in distinct photo-product groups, distinct
// editors and products
const row1 = makeRow({
    id: 1,
    order_id: 100,
    photo_size: 'Foto 15x21',
    child_name: 'José Pérez',
    photo_number: 101,
    variant_search: 'Vertical Celeste',
    editor: vale,
});
const row2 = makeRow({
    id: 2,
    order_id: 101,
    photo_size: 'Foto 10x15',
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
    child_name: 'Luca Gómez',
    photo_number: 104,
    variant_search: 'Horizontal Celeste',
    editor: vale,
});

const groupFoto15x21InA = makeGroup({
    product_id: 1,
    product_name: 'Foto 15x21',
    rows: [row1],
});
const groupFoto10x15InA = makeGroup({
    product_id: 2,
    product_name: 'Foto 10x15',
    rows: [row2],
});
const groupFoto15x21InB = makeGroup({
    product_id: 1,
    product_name: 'Foto 15x21',
    rows: [row3],
});
const groupFoto10x15InC = makeGroup({
    product_id: 2,
    product_name: 'Foto 10x15',
    rows: [row4],
});

const classroom10 = makeClassroom({
    id: 10,
    name: '1ro A',
    order_count: 2,
    photoProductGroups: [groupFoto15x21InA, groupFoto10x15InA],
});
const classroom11 = makeClassroom({
    id: 11,
    name: '1ro B',
    order_count: 1,
    photoProductGroups: [groupFoto15x21InB],
});
const classroom20 = makeClassroom({
    id: 20,
    name: '2do A',
    order_count: 1,
    photoProductGroups: [groupFoto10x15InC],
});

const schoolA: EditionSchool = {
    id: 1,
    name: 'Escuela A',
    classrooms: [classroom10, classroom11],
};

const schoolB: EditionSchool = {
    id: 2,
    name: 'Escuela B',
    classrooms: [classroom20],
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
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto10x15InA, rows: [row2] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('filters by photo_number', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('103'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [
                    {
                        ...classroom11,
                        photoProductGroups: [
                            { ...groupFoto15x21InB, rows: [row3] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('filters by a photo-variant value present in variant_search', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('Horizontal Blanco'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto10x15InA, rows: [row2] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('is accent-insensitive', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setSearch('nino'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [
                    {
                        ...classroom11,
                        photoProductGroups: [
                            { ...groupFoto15x21InB, rows: [row3] },
                        ],
                    },
                ],
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
                classrooms: [
                    {
                        ...classroom11,
                        photoProductGroups: [
                            { ...groupFoto15x21InB, rows: [row3] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('filters by editorId when canManage is true', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setEditorId(1));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto15x21InA, rows: [row1] },
                        ],
                    },
                ],
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
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto10x15InA, rows: [row2] },
                        ],
                    },
                ],
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
        // photo_size is Foto 15x21, so the productName filter excludes it.
        // School B's row4 fails the "Blanco" search, so it drops entirely.
        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolA,
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto10x15InA, rows: [row2] },
                        ],
                    },
                ],
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
                classrooms: [
                    {
                        ...classroom10,
                        order_count: 1,
                        photoProductGroups: [
                            { ...groupFoto10x15InA, rows: [row2] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('recomputes order_count to the surviving distinct orders after filtering', () => {
        // classroom40 has 3 distinct orders (400, 401, 402) spread across two
        // groups: groupKeep holds two orders (400, 401), groupDrop holds one
        // (402, a different product). Filtering by productName drops
        // groupDrop entirely, so order_count must fall from 3 to 2 — NOT the
        // original fixture's order_count.
        const orderA = makeRow({
            id: 7,
            order_id: 400,
            photo_size: 'Foto 15x21',
            child_name: 'Uno',
        });
        const orderB = makeRow({
            id: 8,
            order_id: 401,
            photo_size: 'Foto 15x21',
            child_name: 'Dos',
        });
        const orderC = makeRow({
            id: 9,
            order_id: 402,
            photo_size: 'Foto 10x15',
            child_name: 'Tres',
        });
        const groupKeep = makeGroup({
            product_id: 1,
            product_name: 'Foto 15x21',
            rows: [orderA, orderB],
        });
        const groupDrop = makeGroup({
            product_id: 2,
            product_name: 'Foto 10x15',
            rows: [orderC],
        });
        const classroom40 = makeClassroom({
            id: 40,
            name: '4to A',
            order_count: 3,
            photoProductGroups: [groupKeep, groupDrop],
        });
        const schoolWithThreeOrders: EditionSchool = {
            id: 4,
            name: 'Escuela D',
            classrooms: [classroom40],
        };

        const { result } = renderHook(() =>
            useEditionFilters([schoolWithThreeOrders], true),
        );

        act(() => result.current.setProductName('Foto 15x21'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolWithThreeOrders,
                classrooms: [
                    {
                        ...classroom40,
                        order_count: 2,
                        photoProductGroups: [groupKeep],
                    },
                ],
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

    it('recomputes is_first_of_order when a filter removes the original first row of an order', () => {
        // order_id 200: originalFirst is the designated first row (backend
        // computed against the full unfiltered classroom); sibling shares
        // the same order but is a different product (different group), so
        // filtering by productName keeps only the sibling's group.
        const originalFirst = makeRow({
            id: 5,
            order_id: 200,
            photo_size: 'Foto 15x21',
            child_name: 'Mica Díaz',
            is_first_of_order: true,
        });
        const sibling = makeRow({
            id: 6,
            order_id: 200,
            photo_size: 'Foto 10x15',
            child_name: 'Mica Díaz',
            is_first_of_order: false,
        });
        const groupOriginal = makeGroup({
            product_id: 1,
            product_name: 'Foto 15x21',
            rows: [originalFirst],
        });
        const groupSibling = makeGroup({
            product_id: 2,
            product_name: 'Foto 10x15',
            rows: [sibling],
        });
        const classroomWithSplitOrder = makeClassroom({
            id: 30,
            name: '3ro A',
            order_count: 1,
            photoProductGroups: [groupOriginal, groupSibling],
        });
        const schoolWithSplitOrder: EditionSchool = {
            id: 3,
            name: 'Escuela C',
            classrooms: [classroomWithSplitOrder],
        };

        const { result } = renderHook(() =>
            useEditionFilters([schoolWithSplitOrder], true),
        );

        act(() => result.current.setProductName('Foto 10x15'));

        expect(result.current.filteredSchools).toEqual([
            {
                ...schoolWithSplitOrder,
                classrooms: [
                    {
                        ...classroomWithSplitOrder,
                        photoProductGroups: [
                            {
                                ...groupSibling,
                                rows: [{ ...sibling, is_first_of_order: true }],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('clears classroomId when switching to a school that does not contain it', () => {
        const { result } = renderHook(() => useEditionFilters(schools, true));

        act(() => result.current.setClassroomId(11)); // 1ro B, in Escuela A

        expect(result.current.classroomId).toBe(11);

        act(() => result.current.setSchoolId(2)); // Escuela B doesn't have classroom 11

        expect(result.current.classroomId).toBeNull();
        expect(result.current.filteredSchools).toEqual([schoolB]);
    });
});
