import InputError from '@/components/input-error';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import {
    OrderFormController,
    SchoolLevel,
} from '../hooks/use-create-order-form';

interface SchoolStepProps {
    form: OrderFormController;
    schools: Array<School & { classrooms: Classroom[] }>;
    schoolLevels: SchoolLevel[];
}

export function SchoolStep({ form, schools, schoolLevels }: SchoolStepProps) {
    const {
        levelFilter,
        setLevelFilter,
        selectedSchool,
        setSelectedSchool,
        filteredSchools,
        selectedSchoolData,
        selectedClassroom,
        data,
        setData,
        clearErrors,
        errors,
        errorFlags,
        toStep,
    } = form;

    return (
        <AccordionItem value="schools">
            <AccordionTrigger onClick={toStep('schools')}>
                <div className="flex items-center gap-2">
                    {errorFlags['schools'] && (
                        <AlertCircle className="h-5 w-5 stroke-destructive" />
                    )}
                    Escuela
                    {selectedSchoolData ? (
                        <Badge>
                            {`${selectedSchoolData.name} ${selectedClassroom ? `"${selectedClassroom.name.toUpperCase()}"` : ''}`}
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
                                badgeVariants({ variant: 'outline' }),
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
                            schools.find((s) => s.id === selectedSchool)?.id ??
                                '',
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
                                            school.id === selectedSchool,
                                    )!
                                    .classrooms.map((classroom) => (
                                        <SelectItem
                                            value={String(classroom.id)}
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
                    <Button onClick={toStep('client')}>Siguiente</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
