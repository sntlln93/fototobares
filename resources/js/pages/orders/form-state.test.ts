import { format } from 'date-fns';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    DraftProp,
    clearSavedForm,
    emptyForm,
    persistSavedForm,
    readSavedForm,
    removeDetailAt,
    replaceDetailAt,
    resetPersonalData,
    resolveInitialOrderForm,
} from './form-state';

const draft: DraftProp = {
    id: 7,
    classroom_id: 3,
    child_name: 'Luca',
    client_name: 'Carla López',
    client_phone: '3804000003',
    attended_photo_session: true,
    total_price: 12000,
    payment_plan: 2,
    due_date: '2026-08-01T00:00:00.000000Z',
    products: [{ product_id: 5, note: 'Taza de Luca' }],
    classroom: { id: 3, name: 'a 5', school_id: 9 },
};

beforeEach(() => {
    localStorage.clear();
});

describe('emptyForm', () => {
    it('defaults to an empty order dated today', () => {
        expect(emptyForm()).toEqual({
            classroom_id: 0,
            order_details: [],
            name: '',
            phone: '',
            child_name: '',
            attended_photo_session: null,
            total_price: '0',
            payment_plan: '0',
            due_date: format(new Date(), 'yyyy-MM-dd'),
            draft_id: null,
        });
    });
});

describe('readSavedForm', () => {
    it('returns null when nothing was saved', () => {
        expect(readSavedForm()).toBeNull();
    });

    it('returns null on corrupted JSON', () => {
        localStorage.setItem('orderFormData', '{not json');

        expect(readSavedForm()).toBeNull();
    });

    it('restores the saved order data leaving personal data blank', () => {
        localStorage.setItem(
            'orderFormData',
            JSON.stringify({
                classroom_id: 3,
                order_details: [{ product_id: 5, note: 'nota' }],
                total_price: '12000',
                payment_plan: '2',
                due_date: '2026-09-01',
                selectedSchool: 9,
            }),
        );

        const saved = readSavedForm();

        expect(saved?.selectedSchool).toBe(9);
        expect(saved?.form).toMatchObject({
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'nota' }],
            total_price: '12000',
            payment_plan: '2',
            due_date: '2026-09-01',
            name: '',
            phone: '',
            child_name: '',
        });
    });

    it('fills defaults for missing keys', () => {
        localStorage.setItem('orderFormData', JSON.stringify({}));

        const saved = readSavedForm();

        expect(saved?.form.classroom_id).toBe(0);
        expect(saved?.form.order_details).toEqual([]);
        expect(saved?.selectedSchool).toBe(0);
    });
});

describe('resolveInitialOrderForm', () => {
    it('starts empty without a draft or saved data', () => {
        const initial = resolveInitialOrderForm(null);

        expect(initial.form).toEqual(emptyForm());
        expect(initial.selectedSchool).toBe(0);
        expect(initial.message).toBeNull();
    });

    it('maps the draft including client data and draft id', () => {
        const initial = resolveInitialOrderForm(draft);

        expect(initial.form).toMatchObject({
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'Taza de Luca' }],
            total_price: '12000',
            payment_plan: '2',
            due_date: '2026-08-01',
            name: 'Carla López',
            phone: '3804000003',
            child_name: 'Luca',
            attended_photo_session: true,
            draft_id: 7,
        });
        expect(initial.selectedSchool).toBe(9);
        expect(initial.message).toBe('Borrador #7 cargado');
    });

    it('prefers the draft over saved data', () => {
        localStorage.setItem(
            'orderFormData',
            JSON.stringify({ classroom_id: 99, selectedSchool: 99 }),
        );

        const initial = resolveInitialOrderForm(draft);

        expect(initial.form.classroom_id).toBe(3);
        expect(initial.selectedSchool).toBe(9);
    });

    it('falls back to saved data without a draft', () => {
        localStorage.setItem(
            'orderFormData',
            JSON.stringify({ classroom_id: 3, selectedSchool: 9 }),
        );

        const initial = resolveInitialOrderForm(null);

        expect(initial.form.classroom_id).toBe(3);
        expect(initial.selectedSchool).toBe(9);
        expect(initial.message).toBe('Datos de pedido anterior cargados');
    });

    it('drops saved details whose product no longer exists', () => {
        localStorage.setItem(
            'orderFormData',
            JSON.stringify({
                classroom_id: 3,
                selectedSchool: 9,
                order_details: [
                    { product_id: 5, note: 'vigente' },
                    { product_id: 99, note: 'ya no existe' },
                ],
            }),
        );

        const initial = resolveInitialOrderForm(null, [5, 6]);

        expect(initial.form.order_details).toEqual([
            { product_id: 5, note: 'vigente' },
        ]);
        expect(initial.droppedProducts).toBe(1);
    });

    it('drops draft details whose product no longer exists', () => {
        const initial = resolveInitialOrderForm(
            {
                ...draft,
                products: [
                    { product_id: 5, note: 'vigente' },
                    { product_id: 99, note: 'ya no existe' },
                ],
            },
            [5],
        );

        expect(initial.form.order_details).toEqual([
            { product_id: 5, note: 'vigente' },
        ]);
        expect(initial.droppedProducts).toBe(1);
    });

    it('keeps every detail when no product list is provided', () => {
        const initial = resolveInitialOrderForm(draft);

        expect(initial.form.order_details).toHaveLength(1);
        expect(initial.droppedProducts).toBe(0);
    });
});

describe('persistSavedForm', () => {
    const filledForm = () => ({
        ...emptyForm(),
        classroom_id: 3,
        order_details: [{ product_id: 5, note: 'nota' }],
        total_price: '12000',
        payment_plan: '2',
        due_date: '2026-09-01',
        name: 'Carla López',
        phone: '3804000003',
        child_name: 'Luca',
        attended_photo_session: true,
        draft_id: 7,
    });

    it('persists only the order data, never the personal data', () => {
        persistSavedForm(filledForm(), 9);

        const stored = JSON.parse(localStorage.getItem('orderFormData')!);

        expect(stored).toEqual({
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'nota' }],
            total_price: '12000',
            payment_plan: '2',
            due_date: '2026-09-01',
            selectedSchool: 9,
        });
    });

    it('round-trips through readSavedForm', () => {
        persistSavedForm(filledForm(), 9);

        const saved = readSavedForm();

        expect(saved?.form.order_details).toEqual([
            { product_id: 5, note: 'nota' },
        ]);
        expect(saved?.form.name).toBe('');
        expect(saved?.selectedSchool).toBe(9);
    });

    it('clearSavedForm removes the persisted data', () => {
        persistSavedForm(filledForm(), 9);

        clearSavedForm();

        expect(readSavedForm()).toBeNull();
    });
});

describe('resetPersonalData', () => {
    it('blanks the client fields and keeps the order fields', () => {
        const reset = resetPersonalData({
            ...emptyForm(),
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'nota' }],
            total_price: '12000',
            name: 'Carla López',
            phone: '3804000003',
            child_name: 'Luca',
            attended_photo_session: true,
            draft_id: 7,
        });

        expect(reset).toMatchObject({
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'nota' }],
            total_price: '12000',
            name: '',
            phone: '',
            child_name: '',
            attended_photo_session: null,
            draft_id: null,
        });
    });
});

describe('order details editing', () => {
    const details = () => [
        { product_id: 1, note: 'a' },
        { product_id: 2, note: 'b' },
        { product_id: 3, note: 'c' },
    ];

    it('removes the detail at the given index only', () => {
        expect(removeDetailAt(details(), 1)).toEqual([
            { product_id: 1, note: 'a' },
            { product_id: 3, note: 'c' },
        ]);
    });

    it('replaces the detail at the given index', () => {
        expect(
            replaceDetailAt(details(), 1, [{ product_id: 9, note: 'z' }]),
        ).toEqual([
            { product_id: 1, note: 'a' },
            { product_id: 9, note: 'z' },
            { product_id: 3, note: 'c' },
        ]);
    });

    it('does not mutate the original array', () => {
        const original = details();

        removeDetailAt(original, 0);
        replaceDetailAt(original, 0, []);

        expect(original).toHaveLength(3);
    });
});
