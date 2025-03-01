import { Card } from '@/components/card';
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
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type SchoolLevel = 'Todos' | 'Jardin' | 'Primaria' | 'Secundaria';

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

    const { data, setData, post, processing, errors } = useForm<{
        classroomId: number;
        products: Product[];
        client_name: string;
        client_phone: string;
    }>({
        classroomId: 0,
        products: [],
        client_name: '',
        client_phone: '',
    });

    const _selectedSchool = schools.find((s) => s.id === selectedSchool);

    const filteredSchools = schools.filter(
        (school) => levelFilter === 'Todos' || school.level === levelFilter,
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('orders.store'));
    };

    return (
        <AppLayout>
            <Head title="Nuevo pedido" />
            <Card>
                <form onSubmit={submit}>
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        defaultValue="schools"
                    >
                        <AccordionItem value="schools">
                            <AccordionTrigger>
                                Escuela
                                {_selectedSchool ? (
                                    <Badge className="ml-2">
                                        {_selectedSchool.name}
                                    </Badge>
                                ) : undefined}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-6 px-6">
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
                                    <Label htmlFor="classroomId">Curso</Label>

                                    <Select
                                        disabled={selectedSchool === 0}
                                        name="classroomId"
                                        onValueChange={(value) =>
                                            setData(
                                                'classroomId',
                                                Number(value),
                                            )
                                        }
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
                                                    .classrooms.map(
                                                        (classroom) => (
                                                            <SelectItem
                                                                value={String(
                                                                    classroom.id,
                                                                )}
                                                                key={
                                                                    classroom.id
                                                                }
                                                            >
                                                                {classroom.name.toUpperCase()}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                        </SelectContent>
                                    </Select>

                                    <InputError
                                        message={errors.classroomId}
                                        className="mt-2"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="products">
                            <AccordionTrigger>Productos</AccordionTrigger>
                            <AccordionContent className="px-6">
                                <Combobox
                                    items={combos.map((combo) => ({
                                        label: combo.name,
                                        value: combo.id,
                                    }))}
                                    action={() => console.log('action')}
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
                                    action={() => console.log('action')}
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
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="client">
                            <AccordionTrigger>Cliente</AccordionTrigger>
                            <AccordionContent className="gap-6 px-6">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input
                                        placeholder="Agustín Perez"
                                        type="text"
                                        id="client_name"
                                        name="client_name"
                                        value={data.client_name}
                                        onChange={(e) =>
                                            setData(
                                                'client_name',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.client_name} />
                                </div>

                                <div>
                                    <Label>Teléfono</Label>
                                    <Input
                                        placeholder="3804125834"
                                        type="text"
                                        id="client_phone"
                                        name="client_phone"
                                        value={data.client_phone}
                                        onChange={(e) =>
                                            setData(
                                                'client_phone',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full"
                                    />
                                    <InputHint
                                        className="mt-2"
                                        message="Un número de teléfono válido contiene sólo 10 dígitos"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.client_phone}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="order">
                            <AccordionTrigger>Pedido</AccordionTrigger>
                            <AccordionContent className="px-6">
                                Yes. It&apos;s animated by default, but you can
                                disable it if you prefer.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                        <Button variant="secondary" asChild>
                            <Link href={route('orders.index')}>Cancelar</Link>
                        </Button>

                        <Button variant="outline" disabled={processing}>
                            Guardar
                        </Button>

                        <Button disabled={processing}>
                            Guardar y seguir vendiendo
                        </Button>
                    </div>
                </form>
            </Card>
        </AppLayout>
    );
}
