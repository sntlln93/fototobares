import { format } from 'date-fns';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    DraftProp,
    emptyForm,
    readSavedForm,
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
});
