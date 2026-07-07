import { format } from 'date-fns';
import { ProductOrder } from './form';

export type DraftProp = {
    id: number;
    classroom_id: number;
    child_name: string | null;
    client_name: string | null;
    client_phone: string | null;
    attended_photo_session: boolean | null;
    total_price: number;
    payment_plan: number;
    due_date: string | null;
    products: ProductOrder[] | null;
    classroom: Classroom;
};

export type OrderFormData = {
    classroom_id: number;
    order_details: ProductOrder[];
    name: string;
    phone: string;
    child_name: string;
    attended_photo_session: boolean | null;
    total_price: string;
    payment_plan: string;
    due_date: string;
    draft_id: number | null;
};

export type InitialOrderForm = {
    form: OrderFormData;
    selectedSchool: number;
    message: string | null;
};

export const emptyForm = (): OrderFormData => ({
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

/**
 * Restores the "save and keep selling" data persisted in localStorage.
 * Personal data is intentionally left blank.
 */
export const readSavedForm = (): {
    form: OrderFormData;
    selectedSchool: number;
} | null => {
    const savedData = localStorage.getItem('orderFormData');

    if (!savedData) return null;

    try {
        const parsed = JSON.parse(savedData);

        return {
            form: {
                ...emptyForm(),
                classroom_id: parsed.classroom_id ?? 0,
                order_details: parsed.order_details ?? [],
                total_price: parsed.total_price ?? '0',
                payment_plan: parsed.payment_plan ?? '0',
                due_date: parsed.due_date ?? format(new Date(), 'yyyy-MM-dd'),
            },
            selectedSchool: parsed.selectedSchool ?? 0,
        };
    } catch {
        return null;
    }
};

/**
 * Persists the order data for "save and keep selling", excluding the
 * client's personal data on purpose.
 */
export const persistSavedForm = (
    form: OrderFormData,
    selectedSchool: number,
): void => {
    localStorage.setItem(
        'orderFormData',
        JSON.stringify({
            classroom_id: form.classroom_id,
            order_details: form.order_details,
            total_price: form.total_price,
            payment_plan: form.payment_plan,
            due_date: form.due_date,
            selectedSchool,
        }),
    );
};

export const clearSavedForm = (): void => {
    localStorage.removeItem('orderFormData');
};

/**
 * Blank slate for the next client, keeping the order data.
 */
export const resetPersonalData = (form: OrderFormData): OrderFormData => ({
    ...form,
    name: '',
    phone: '',
    child_name: '',
    attended_photo_session: null,
    draft_id: null,
});

export const removeDetailAt = (
    details: ProductOrder[],
    index: number,
): ProductOrder[] => details.filter((_, i) => i !== index);

export const replaceDetailAt = (
    details: ProductOrder[],
    index: number,
    replacements: ProductOrder[],
): ProductOrder[] => {
    const next = [...details];
    next.splice(index, 1, ...replacements);

    return next;
};

/**
 * Initial values for the order form: a draft ("Ver" in borradores) wins
 * over localStorage. Must be resolved before useForm: setting them with
 * setData in an effect gets lost.
 */
export const resolveInitialOrderForm = (
    draft?: DraftProp | null,
): InitialOrderForm => {
    if (draft) {
        return {
            form: {
                ...emptyForm(),
                classroom_id: draft.classroom_id,
                order_details: draft.products ?? [],
                total_price: String(draft.total_price ?? 0),
                payment_plan: String(draft.payment_plan ?? 0),
                due_date:
                    draft.due_date?.slice(0, 10) ??
                    format(new Date(), 'yyyy-MM-dd'),
                name: draft.client_name ?? '',
                phone: draft.client_phone ?? '',
                child_name: draft.child_name ?? '',
                attended_photo_session: draft.attended_photo_session,
                draft_id: draft.id,
            },
            selectedSchool: draft.classroom.school_id,
            message: `Borrador #${draft.id} cargado`,
        };
    }

    const saved = readSavedForm();

    if (saved) {
        return {
            ...saved,
            message: 'Datos de pedido anterior cargados',
        };
    }

    return { form: emptyForm(), selectedSchool: 0, message: null };
};
