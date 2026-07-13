import { act, renderHook } from '@testing-library/react';
import { FormEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DraftProp, OrderFormData } from '../form-state';
import { useCreateOrderForm } from '../hooks/use-create-order-form';

const inertia = vi.hoisted(() => ({
    post: vi.fn(),
    errors: {} as Record<string, string>,
}));

vi.mock('@inertiajs/react', async () => {
    const { useState } = await import('react');

    // Stateful stand-in: the hook relies on setData re-rendering with the
    // new values (e.g. resetForNextClient), so a static mock would hide bugs
    function useForm(initial: OrderFormData) {
        const [data, setData] = useState(initial);

        return {
            data,
            setData: (
                keyOrData: keyof OrderFormData | OrderFormData,
                value?: unknown,
            ) => {
                if (typeof keyOrData === 'string') {
                    setData((prev) => ({ ...prev, [keyOrData]: value }));
                } else {
                    setData(keyOrData);
                }
            },
            post: inertia.post,
            processing: false,
            errors: inertia.errors,
            clearErrors: vi.fn(),
        };
    }

    return { useForm };
});

const axiosPost = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({ default: { post: axiosPost } }));

const toast = vi.hoisted(() => ({
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
}));

vi.mock('sonner', () => ({ toast }));

const taza = { id: 5, name: 'Taza' } as Product;
const mural = { id: 6, name: 'Mural' } as Product;
const products = [taza, mural];

const combos = [
    {
        id: 2,
        name: 'Combo escolar',
        suggested_price: 5000,
        default_payments: 3,
        products: [taza, mural],
    } as Combo & { products: Product[] },
];

const schools = [
    {
        id: 9,
        name: 'Escuela Belgrano',
        level: 'Primaria',
        classrooms: [{ id: 3, name: '5 A', school_id: 9 }],
    },
    {
        id: 10,
        name: 'Colegio Sarmiento',
        level: 'Secundaria',
        classrooms: [{ id: 7, name: '2 B', school_id: 10 }],
    },
] as Array<School & { classrooms: Classroom[] }>;

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
    classroom: { id: 3, name: '5 A', school_id: 9 },
};

const filledForm = (data: OrderFormData): OrderFormData => ({
    ...data,
    classroom_id: 3,
    name: 'Carla López',
    phone: '3804000003',
    child_name: 'Luca',
    attended_photo_session: true,
    order_details: [{ product_id: 5, note: 'Taza de Luca' }],
    total_price: '12000',
    payment_plan: '2',
    due_date: '2026-09-01',
});

const formEvent = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent;

const renderForm = (draftProp: DraftProp | null = null) =>
    renderHook(() =>
        useCreateOrderForm({ products, combos, schools, draft: draftProp }),
    );

beforeEach(() => {
    vi.clearAllMocks();
    inertia.post.mockReset();
    axiosPost.mockReset();
    inertia.errors = {};
    vi.stubGlobal(
        'route',
        (name: string, params?: { _query?: Record<string, string> }) => {
            const query = params?._query
                ? `?${new URLSearchParams(params._query).toString()}`
                : '';
            return `http://localhost/${name}${query}`;
        },
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useCreateOrderForm', () => {
    it('starts blank on the schools step without a draft', () => {
        const { result } = renderForm();

        expect(result.current.accordionValue).toBe('schools');
        expect(result.current.selectedSchool).toBe(0);
        expect(result.current.data).toMatchObject({
            classroom_id: 0,
            order_details: [],
            name: '',
            total_price: '0',
            draft_id: null,
        });
        expect(result.current.errorFlags).toEqual({
            client: false,
            order: false,
            products: false,
            schools: false,
        });
        expect(toast.info).not.toHaveBeenCalled();
        expect(toast.warning).not.toHaveBeenCalled();
    });

    it('hydrates from a draft, selects its school and announces it', () => {
        const { result } = renderForm(draft);

        expect(result.current.selectedSchool).toBe(9);
        expect(result.current.data).toMatchObject({
            classroom_id: 3,
            order_details: [{ product_id: 5, note: 'Taza de Luca' }],
            name: 'Carla López',
            phone: '3804000003',
            total_price: '12000',
            payment_plan: '2',
            due_date: '2026-08-01',
            draft_id: 7,
        });
        expect(toast.info).toHaveBeenCalledWith('Borrador #7 cargado');
        expect(toast.warning).not.toHaveBeenCalled();
    });

    it('drops draft products that no longer exist and warns about it', () => {
        const { result } = renderForm({
            ...draft,
            products: [
                { product_id: 5, note: 'vigente' },
                { product_id: 99, note: 'ya no existe' },
            ],
        });

        expect(result.current.data.order_details).toEqual([
            { product_id: 5, note: 'vigente' },
        ]);
        expect(toast.warning).toHaveBeenCalledWith(
            expect.stringContaining('Se quitaron 1 producto(s)'),
        );
    });

    it('opens the requested step and collapses it when re-clicked', () => {
        const { result } = renderForm();

        const event = formEvent();
        act(() => result.current.toStep('products')(event));

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result.current.accordionValue).toBe('products');

        act(() => result.current.toStep('products')(formEvent()));

        expect(result.current.accordionValue).toBeUndefined();
    });

    it('derives the selected school, classroom and level filter', () => {
        const { result } = renderForm();

        act(() => result.current.setSelectedSchool(9));
        act(() =>
            result.current.setData({ ...result.current.data, classroom_id: 3 }),
        );

        expect(result.current.selectedSchoolData?.name).toBe(
            'Escuela Belgrano',
        );
        expect(result.current.selectedClassroom?.name).toBe('5 A');
        expect(result.current.filteredSchools).toHaveLength(2);

        act(() => result.current.setLevelFilter('Secundaria'));

        expect(result.current.filteredSchools.map((s) => s.id)).toEqual([10]);
    });

    it('counts combo repetitions and standalone details separately', () => {
        const { result } = renderForm();

        act(() =>
            result.current.setData({
                ...result.current.data,
                order_details: [
                    { product_id: 5, combo_id: 2, note: '' },
                    { product_id: 6, combo_id: 2, note: '' },
                    { product_id: 5, note: '' },
                ],
            }),
        );

        expect(result.current.counts).toEqual({
            combos: { 2: 2 },
            undefinedCount: 1,
        });
    });

    it('maps validation errors to their accordion step', () => {
        inertia.errors = {
            phone: 'requerido',
            due_date: 'requerido',
            order_details: 'requerido',
            classroom_id: 'requerido',
        };

        const { result } = renderForm();

        expect(result.current.errorFlags).toEqual({
            client: true,
            order: true,
            products: true,
            schools: true,
        });
    });

    it('adds a combo to the cart summing its price into the total', () => {
        const { result } = renderForm();

        act(() => result.current.handleAddCombo(2));

        expect(result.current.data.total_price).toBe('5000');
        expect(
            result.current.openAddModal?.map((p) => ({
                id: p.id,
                combo_id: p.combo_id,
            })),
        ).toEqual([
            { id: 5, combo_id: 2 },
            { id: 6, combo_id: 2 },
        ]);
    });

    it('posts back to the index and keeps the form on a plain save', () => {
        inertia.post.mockImplementation(
            (_url: string, options?: { onSuccess?: () => void }) =>
                options?.onSuccess?.(),
        );

        const { result } = renderForm();

        act(() => result.current.setData(filledForm(result.current.data)));
        act(() => result.current.submit(formEvent()));

        expect(decodeURIComponent(String(inertia.post.mock.calls[0][0]))).toBe(
            'http://localhost/orders.store?redirectTo=http://localhost/orders.index',
        );
        expect(toast.success).toHaveBeenCalledWith('Pedido guardado con éxito');
        // No continuous-sale reset on a plain save
        expect(result.current.data.name).toBe('Carla López');
        expect(result.current.data.order_details).toHaveLength(1);
        expect(result.current.accordionValue).toBe('schools');
        expect(toast.info).not.toHaveBeenCalled();
    });

    // Regression for #101: "guardar y seguir vendiendo" must keep the
    // school/classroom and payment terms but never the previous client
    it('resets for the next client after saving and continuing', () => {
        inertia.post.mockImplementation(
            (_url: string, options?: { onSuccess?: () => void }) =>
                options?.onSuccess?.(),
        );

        const { result } = renderForm();

        act(() => result.current.setData(filledForm(result.current.data)));
        act(() => result.current.handleSaveAndContinue(formEvent()));

        expect(decodeURIComponent(String(inertia.post.mock.calls[0][0]))).toBe(
            'http://localhost/orders.store?redirectTo=http://localhost/orders.create',
        );
        expect(result.current.data).toEqual({
            classroom_id: 3,
            payment_plan: '2',
            due_date: '2026-09-01',
            name: '',
            phone: '',
            child_name: '',
            attended_photo_session: null,
            order_details: [],
            total_price: '0',
            draft_id: null,
        });
        expect(result.current.accordionValue).toBe('client');
        expect(toast.success).toHaveBeenCalledWith('Pedido guardado con éxito');
        expect(toast.info).toHaveBeenCalledWith(
            expect.stringContaining('Se conservaron la escuela'),
        );
    });

    it('posts the draft payload and navigates to the drafts index', async () => {
        axiosPost.mockResolvedValue({});
        const fakeLocation = { href: '' };
        vi.stubGlobal('location', fakeLocation);

        const { result } = renderForm();

        act(() => result.current.setData(filledForm(result.current.data)));
        // Async at runtime even though the FormEventHandler type says void
        await act(() =>
            Promise.resolve(result.current.handleSaveAsDraft(formEvent())),
        );

        expect(axiosPost).toHaveBeenCalledWith(
            'http://localhost/drafts.store',
            {
                classroom_id: 3,
                child_name: 'Luca',
                client_name: 'Carla López',
                client_phone: '3804000003',
                attended_photo_session: true,
                total_price: '12000',
                payment_plan: '2',
                due_date: '2026-09-01',
                products: [{ product_id: 5, note: 'Taza de Luca' }],
            },
        );
        expect(toast.success).toHaveBeenCalledWith(
            'Borrador guardado exitosamente',
        );
        expect(fakeLocation.href).toBe('http://localhost/drafts.index');
    });

    it('reports a draft save failure without navigating', async () => {
        axiosPost.mockRejectedValue(new Error('500'));
        const fakeLocation = { href: '' };
        vi.stubGlobal('location', fakeLocation);

        const { result } = renderForm();

        await act(() =>
            Promise.resolve(result.current.handleSaveAsDraft(formEvent())),
        );

        expect(toast.error).toHaveBeenCalledWith(
            'Error al guardar el borrador',
        );
        expect(toast.success).not.toHaveBeenCalled();
        expect(fakeLocation.href).toBe('');
    });
});
