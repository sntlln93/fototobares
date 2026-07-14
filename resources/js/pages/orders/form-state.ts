import { format } from 'date-fns';
import { ComboWithProducts, ProductOrder } from './form';

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
    /** Restored details dropped because their product no longer exists */
    droppedProducts: number;
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
 * Blank slate for the next client of a continuous sale ("guardar y seguir
 * vendiendo"): keeps the school and the payment terms, clears the client
 * and the products (detail notes carry the previous child's name), and
 * zeroes the price so re-adding a combo doesn't sum over the old total.
 */
export const resetForNextClient = (form: OrderFormData): OrderFormData => ({
    ...form,
    name: '',
    phone: '',
    child_name: '',
    attended_photo_session: null,
    order_details: [],
    total_price: '0',
    draft_id: null,
});

export const removeDetailAt = (
    details: ProductOrder[],
    index: number,
): ProductOrder[] => details.filter((_, i) => i !== index);

/**
 * A combo may carry several units of the same product (`pivot.quantity`): each
 * unit is its own detail. They are configured once — two identical products of
 * the same combo share variant and note — and replicated here.
 */
export const expandComboQuantities = (
    details: ProductOrder[],
    combos: ComboWithProducts[],
): ProductOrder[] =>
    details.flatMap((detail) => {
        const quantity = combos
            .find((combo) => combo.id === detail.combo_id)
            ?.products.find((product) => product.id === detail.product_id)
            ?.pivot.quantity;

        return Array.from({ length: Math.max(quantity ?? 1, 1) }, () => ({
            ...detail,
        }));
    });

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
 * Drops restored details whose product no longer exists (deleted product,
 * or a re-seeded database): rendering them would crash the page.
 */
const keepExistingProducts = (
    details: ProductOrder[],
    validProductIds?: number[],
): { details: ProductOrder[]; dropped: number } => {
    if (!validProductIds) {
        return { details, dropped: 0 };
    }

    const kept = details.filter((detail) =>
        validProductIds.includes(detail.product_id),
    );

    return { details: kept, dropped: details.length - kept.length };
};

/**
 * Initial values for the order form: a draft ("Ver" in borradores) fills
 * the form, any other entry starts blank. Continuous selling never gets
 * here: Inertia preserves the component state through the POST redirect
 * (no remount), so that reset happens in memory via resetForNextClient.
 * Must be resolved before useForm: setting them with setData in an
 * effect gets lost.
 */
export const resolveInitialOrderForm = (
    draft?: DraftProp | null,
    validProductIds?: number[],
): InitialOrderForm => {
    if (draft) {
        const { details, dropped } = keepExistingProducts(
            draft.products ?? [],
            validProductIds,
        );

        return {
            form: {
                ...emptyForm(),
                classroom_id: draft.classroom_id,
                order_details: details,
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
            droppedProducts: dropped,
        };
    }

    return {
        form: emptyForm(),
        selectedSchool: 0,
        message: null,
        droppedProducts: 0,
    };
};
