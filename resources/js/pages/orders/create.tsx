import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    Edit,
    PlusIcon,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Trash,
    User,
    Users,
} from 'lucide-react';
import { FormEvent, FormEventHandler, useState } from 'react';
import { AddDetail } from './add-detail';
import { ProductOrder } from './form';

type SchoolLevel = 'Todos' | 'Jardin' | 'Primaria' | 'Secundaria';
type AccordionValue = 'schools' | 'products' | 'client' | 'order' | undefined;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: route('orders.index'),
    },
    {
        title: 'Nuevo pedido',
        href: route('orders.create'),
    },
];

export default function CreateOrder({
    schoolLevels,
    combos,
    schools,
    products,
}: PageProps<{
    schoolLevels: SchoolLevel[];
    combos: Combo[];
    schools: School[];
    products: Product[];
}>) {
    const [selectedSchool, setSelectedSchool] = useState<number>(0);
    const [levelFilter, setLevelFilter] = useState<SchoolLevel>('Todos');

    const [comboDropdownOpen, setComboDropdownOpen] = useState(false);
    const [productDropdownOpen, setProductDropdownOpen] = useState(false);

    const [accordionValue, setAccordionValue] =
        useState<AccordionValue>('schools');

    const [openAddModal, setOpenAddModal] = useState<
        (Product & { combo_id?: number })[] | null
    >(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm<{
        classroom_id: number;
        order_details: ProductOrder[];
        name: string;
        phone: string;
        total_price: string;
        payments: string;
        due_date: string;
    }>({
        classroom_id: 0,
        order_details: [],
        name: '',
        phone: '',
        total_price: '0',
        payments: '0',
        due_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const _selectedSchool = schools.find((s) => s.id === selectedSchool);
    const _selectedClassroom = _selectedSchool?.classrooms.find(
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

    const error_count: Record<Exclude<AccordionValue, undefined>, boolean> = {
        client: !!errors.name || !!errors.phone,
        order: !!errors.total_price || !!errors.payments || !!errors.due_date,
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('orders.store'));
    };

    const handleAddProduct = (id: number) => {
        setOpenAddModal([products.find((p) => p.id === id)!]);
    };

    const handleAddCombo = (id: number) => {
        const combo = combos.find((p) => p.id === id)!;
        setData('total_price', data.total_price + combo.suggested_price);
        setOpenAddModal(combo.products.map((p) => ({ ...p, combo_id: id })));
    };

    const setProductsOrder = (productsOrder: ProductOrder[]) =>
        setData('order_details', [...data.order_details, ...productsOrder]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo pedido" />
            {openAddModal ? (
                <AddDetail
                    addProducts={setProductsOrder}
                    products={openAddModal}
                    show={Boolean(openAddModal)}
                    onClose={() => setOpenAddModal(null)}
                />
            ) : undefined}

            <form onSubmit={submit} className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={accordionValue}
                >
                    <AccordionItem value="schools">
                        <AccordionTrigger onClick={toStep('schools')}>
                            <div className="flex items-center gap-2">
                                {error_count['schools'] && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Escuela
                                {_selectedSchool ? (
                                    <Badge>
                                        {`${_selectedSchool.name} ${_selectedClassroom ? `"${_selectedClassroom.name.toUpperCase()}"` : ''}`}
                                    </Badge>
                                ) : undefined}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-3 px-1">
                            <div className="flex gap-2 py-2">
                                Niveles:
                                {schoolLevels.map((level) => (
                                    <button
                                        key={level}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setLevelFilter(level);
                                        }}
                                        className={cn(
                                            badgeVariants({
                                                variant: 'outline',
                                            }),
                                            levelFilter === level &&
                                                'border border-primary',
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <Label htmlFor="schoolId">Escuela</Label>

                                <Select
                                    value={String(
                                        schools.find(
                                            (s) => s.id === selectedSchool,
                                        )?.id ?? '',
                                    )}
                                    name="schoolId"
                                    onValueChange={(value) =>
                                        setSelectedSchool(Number(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSchools.map((school) => (
                                            <SelectItem
                                                value={String(school.id)}
                                                key={school.id}
                                            >
                                                {school.name}
                                                <Badge className="ml-1">
                                                    {school.level}
                                                </Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="classroom_id">Curso</Label>

                                <Select
                                    value={String(data.classroom_id)}
                                    disabled={selectedSchool === 0}
                                    name="classroom_id"
                                    onValueChange={(value) => {
                                        clearErrors('classroom_id');
                                        setData('classroom_id', Number(value));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedSchool !== 0 &&
                                            schools
                                                .find(
                                                    (school) =>
                                                        school.id ===
                                                        selectedSchool,
                                                )!
                                                .classrooms.map((classroom) => (
                                                    <SelectItem
                                                        value={String(
                                                            classroom.id,
                                                        )}
                                                        key={classroom.id}
                                                    >
                                                        {classroom.name.toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                    </SelectContent>
                                </Select>

                                <InputError
                                    message={errors.classroom_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button onClick={toStep('products')}>
                                    Siguiente
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="client">
                        <AccordionTrigger onClick={toStep('client')}>
                            <div className="flex items-center gap-2">
                                {error_count['client'] && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Cliente
                                {data.name && <Badge>{`${data.name}`}</Badge>}
                                {data.phone && <Badge>{`${data.phone}`}</Badge>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <div>
                                <Label>Nombre</Label>
                                <Input
                                    placeholder="Agustín Perez"
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="mt-3">
                                <Label>Teléfono</Label>
                                <InputHint
                                    className="mt-2"
                                    message="Un número de teléfono válido contiene sólo 10 dígitos"
                                />
                                <Input
                                    placeholder="3804125834"
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={toStep('products')}
                                >
                                    Anterior
                                </Button>

                                <Button onClick={toStep('order')}>
                                    Siguiente
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="products">
                        <AccordionTrigger onClick={toStep('products')}>
                            <div className="flex items-center gap-2">
                                {error_count['products'] && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Productos
                                {data.order_details && (
                                    <Badge className="ml-2">{`${data.order_details.length} productos`}</Badge>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <Combobox
                                items={combos.map((combo) => ({
                                    label: combo.name,
                                    value: combo.id,
                                }))}
                                action={(value) =>
                                    handleAddCombo(Number(value))
                                }
                                open={comboDropdownOpen}
                                setOpen={setComboDropdownOpen}
                                placeholder="Buscar combo"
                            >
                                <Button variant="secondary" size="sm">
                                    Añadir desde combo
                                    <PlusIcon />
                                </Button>
                            </Combobox>

                            <Combobox
                                items={products.map((product) => ({
                                    label: product.name,
                                    value: product.id,
                                }))}
                                action={(value) =>
                                    handleAddProduct(Number(value))
                                }
                                open={productDropdownOpen}
                                setOpen={setProductDropdownOpen}
                                placeholder="Buscar producto"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="ml-2"
                                >
                                    Añadir producto
                                    <PlusIcon />
                                </Button>
                            </Combobox>

                            <ul className="my-2 gap-4">
                                {data.order_details.map((selected) => {
                                    const product = products.find(
                                        (p) => p.id === selected.product_id,
                                    )!;
                                    const combo = combos.find(
                                        (c) => c.id === selected.combo_id,
                                    );
                                    return (
                                        <li
                                            className="flex items-center justify-between rounded-md border border-input bg-background px-4 py-2"
                                            key={`${product.id}${combo ? combo.id : ''}`}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <span>
                                                    {product.name}
                                                    {combo
                                                        ? ` (combo ${combo.name})`
                                                        : ''}
                                                </span>
                                                {product.product_type_id ===
                                                1 ? (
                                                    <>
                                                        <div className="flex items-center">
                                                            <Badge
                                                                variant="outline"
                                                                className="gap-1 rounded-lg"
                                                            >
                                                                <Square
                                                                    className="h-4 w-4"
                                                                    style={{
                                                                        fill: selected
                                                                            .variant
                                                                            ?.color,
                                                                    }}
                                                                />
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="rounded-lg"
                                                            >
                                                                {
                                                                    selected
                                                                        .variant
                                                                        ?.background
                                                                }
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="rounded-lg"
                                                            >
                                                                {selected
                                                                    .variant
                                                                    ?.photo_type ===
                                                                'individual' ? (
                                                                    <User className="h-4 w-4" />
                                                                ) : (
                                                                    <Users className="h-4 w-4" />
                                                                )}
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="rounded-lg"
                                                            >
                                                                {selected
                                                                    .variant
                                                                    ?.orientation ===
                                                                'vertical' ? (
                                                                    <RectangleVertical className="h-4 w-4" />
                                                                ) : (
                                                                    <RectangleHorizontal className="h-4 w-4" />
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    </>
                                                ) : undefined}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="warning"
                                                    size="icon"
                                                    disabled={
                                                        product.product_type_id !==
                                                        1
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <InputError message={errors.order_details} />

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={toStep('schools')}
                                >
                                    Anterior
                                </Button>

                                <Button onClick={toStep('client')}>
                                    Siguiente
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="order">
                        <AccordionTrigger onClick={toStep('order')}>
                            <div className="flex items-center gap-2">
                                {error_count['products'] && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Pedido
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <div className="mt-3">
                                <Label>Precio final</Label>
                                <InputHint
                                    message={`Calculado a base de (${Object.keys(counts.combos).length}) combo y (${counts.undefinedCount}) productos`}
                                />
                                <Input
                                    type="number"
                                    id="total_price"
                                    name="total_price"
                                    value={data.total_price}
                                    onChange={(e) =>
                                        setData('total_price', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.total_price} />
                            </div>

                            <div className="mt-3">
                                <Label>Cuotas</Label>
                                <Input
                                    type="number"
                                    id="payments"
                                    name="payments"
                                    value={data.payments}
                                    onChange={(e) =>
                                        setData('payments', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.payments}
                                />
                            </div>

                            <div className="mt-3">
                                <Label>Primer vencimiento</Label>
                                <div className="block">
                                    <DatePicker
                                        placeholder="Primer vencimiento"
                                        date={
                                            data.due_date
                                                ? new Date(data.due_date)
                                                : new Date()
                                        }
                                        setDate={(date) =>
                                            setData(
                                                'due_date',
                                                format(
                                                    date ?? new Date(),
                                                    'yyyy-MM-dd',
                                                ),
                                            )
                                        }
                                    />
                                </div>

                                <InputError
                                    className="mt-2"
                                    message={errors.due_date}
                                />
                            </div>

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button variant="outline" asChild>
                                    <Link href={route('orders.index')}>
                                        Cancelar
                                    </Link>
                                </Button>

                                <Button
                                    variant="secondary"
                                    disabled={processing}
                                >
                                    Guardar
                                </Button>

                                <Button disabled={processing}>
                                    Guardar y seguir vendiendo
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </form>
        </AppLayout>
    );
}
