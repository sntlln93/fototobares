import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    DraftProp,
    OrderFormData,
    resetForNextClient,
    resolveInitialOrderForm,
} from '../form-state';
import { useOrderProducts } from './use-order-products';

export type SchoolLevel = 'Todos' | 'Jardin' | 'Primaria' | 'Secundaria';
export type AccordionValue =
    'schools' | 'products' | 'client' | 'order' | undefined;

interface UseCreateOrderFormParams {
    products: Product[];
    combos: Array<Combo & { products: Product[] }>;
    schools: Array<School & { classrooms: Classroom[] }>;
    draft?: DraftProp | null;
}

export function useCreateOrderForm({
    products,
    combos,
    schools,
    draft,
}: UseCreateOrderFormParams) {
    const [initial] = useState(() =>
        resolveInitialOrderForm(
            draft,
            products.map((product) => product.id),
        ),
    );

    const [selectedSchool, setSelectedSchool] = useState<number>(
        initial.selectedSchool,
    );
    const [levelFilter, setLevelFilter] = useState<SchoolLevel>('Todos');

    const [comboDropdownOpen, setComboDropdownOpen] = useState(false);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);

    const [accordionValue, setAccordionValue] =
        useState<AccordionValue>('schools');

    const { data, setData, post, processing, errors, clearErrors } =
        useForm<OrderFormData>(initial.form);

    const productCart = useOrderProducts({ data, setData, products, combos });

    useEffect(() => {
        if (initial.message) {
            toast.info(initial.message);
        }

        if (initial.droppedProducts > 0) {
            toast.warning(
                `Se quitaron ${initial.droppedProducts} producto(s) del pedido recuperado porque ya no existen. Revisá el precio final.`,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedSchoolData = schools.find((s) => s.id === selectedSchool);
    const selectedClassroom = selectedSchoolData?.classrooms.find(
        (c) => c.id === data.classroom_id,
    );

    const filteredSchools = schools.filter(
        (school) => levelFilter === 'Todos' || school.level === levelFilter,
    );

    const counts = data.order_details.reduce<{
        combos: Record<number, number>;
        undefinedCount: number;
    }>(
        (acc, order) => {
            if (order.combo_id !== undefined) {
                acc.combos[order.combo_id] =
                    (acc.combos[order.combo_id] || 0) + 1;
            } else {
                acc.undefinedCount++;
            }
            return acc;
        },
        { combos: {}, undefinedCount: 0 },
    );

    const errorFlags: Record<Exclude<AccordionValue, undefined>, boolean> = {
        client: !!errors.name || !!errors.phone,
        order:
            !!errors.total_price || !!errors.payment_plan || !!errors.due_date,
        products: !!errors.order_details,
        schools: !!errors.classroom_id,
    };

    const toStep = (newAccordionValue: AccordionValue) => {
        return (e: FormEvent) => {
            e.preventDefault();

            if (newAccordionValue === accordionValue) {
                return setAccordionValue(undefined);
            }

            setAccordionValue(newAccordionValue);
        };
    };

    const submit = (e: FormEvent, saveAndContinue = false) => {
        e.preventDefault();

        post(
            route('orders.store', {
                _query: {
                    redirectTo: route(
                        saveAndContinue ? 'orders.create' : 'orders.index',
                    ),
                },
            }),
            {
                onSuccess: () => {
                    toast.success('Pedido guardado con éxito');
                    if (saveAndContinue) {
                        setData(resetForNextClient(data));
                        setAccordionValue('client');
                        toast.info(
                            'Se conservaron la escuela, las cuotas y el vencimiento. Cargá el cliente y los productos.',
                        );
                    }
                },
            },
        );
    };

    const handleSaveAndContinue: FormEventHandler = (e) => {
        submit(e, true);
    };

    const handleSaveAsDraft: FormEventHandler = async (e) => {
        e.preventDefault();

        try {
            await axios.post(route('drafts.store'), {
                classroom_id: data.classroom_id,
                child_name: data.child_name,
                client_name: data.name,
                client_phone: data.phone,
                attended_photo_session: data.attended_photo_session,
                total_price: data.total_price,
                payment_plan: data.payment_plan,
                due_date: data.due_date,
                products: data.order_details,
            });

            toast.success('Borrador guardado exitosamente');
            window.location.href = route('drafts.index');
        } catch {
            toast.error('Error al guardar el borrador');
        }
    };

    return {
        ...productCart,
        data,
        setData,
        processing,
        errors,
        clearErrors,
        selectedSchool,
        setSelectedSchool,
        levelFilter,
        setLevelFilter,
        comboDropdownOpen,
        setComboDropdownOpen,
        productDropdownOpen,
        setProductDropdownOpen,
        accordionValue,
        selectedSchoolData,
        selectedClassroom,
        filteredSchools,
        counts,
        errorFlags,
        toStep,
        submit,
        handleSaveAndContinue,
        handleSaveAsDraft,
    };
}

export type OrderFormController = ReturnType<typeof useCreateOrderForm>;
