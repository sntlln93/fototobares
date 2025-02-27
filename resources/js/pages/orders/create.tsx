import { Card } from '@/components/card';
import InputError from '@/components/input-error';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { FormEventHandler, useState } from 'react';

type SchoolLevel = 'Todos' | 'Jardin' | 'Primaria' | 'Secundaria';

export default function CreateOrder({
    schoolLevels,
    combos,
    schools,
}: PageProps<{
    schoolLevels: SchoolLevel[];
    combos: Combo[];
    schools: School[];
}>) {
    const [selectedSchool, setSelectedSchool] = useState<number>(0);
    const [levelFilter, setLevelFilter] = useState<SchoolLevel>('Todos');

    const { data, setData, post, processing, errors } = useForm<{
        classroomId: number;
    }>({
        classroomId: 0,
    });

    console.log({ data, combos, schools, selectedSchool });
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
                            <AccordionTrigger>Escuela</AccordionTrigger>
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
                        <AccordionItem value="combos">
                            <AccordionTrigger>Combo</AccordionTrigger>
                            <AccordionContent className="px-6">
                                Yes. It comes with default styles that matches
                                the other components&apos; aesthetic.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="client">
                            <AccordionTrigger>Cliente</AccordionTrigger>
                            <AccordionContent className="px-6">
                                Yes. It&apos;s animated by default, but you can
                                disable it if you prefer.
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
