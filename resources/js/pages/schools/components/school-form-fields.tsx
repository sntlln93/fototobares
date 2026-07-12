import { Button } from '@/components/ui/button';
import { Link, type SetDataAction } from '@inertiajs/react';
import { type SchoolFormData } from '../form';
import { AddressSection } from './address-section';
import { PrincipalSection } from './principal-section';
import { SchoolDetailsSection } from './school-details-section';

interface SchoolFormFieldsProps {
    data: SchoolFormData;
    setData: SetDataAction<SchoolFormData>;
    getError: (path: string) => string;
    processing: boolean;
    users: User[];
    levelDefaultValue: string;
    levelErrorPath: string;
    encargadoValue?: string;
}

export function SchoolFormFields({
    data,
    setData,
    getError,
    processing,
    users,
    levelDefaultValue,
    levelErrorPath,
    encargadoValue,
}: SchoolFormFieldsProps) {
    return (
        <>
            <SchoolDetailsSection
                data={data}
                setData={setData}
                getError={getError}
                users={users}
                levelDefaultValue={levelDefaultValue}
                levelErrorPath={levelErrorPath}
                encargadoValue={encargadoValue}
            />

            <PrincipalSection
                data={data}
                setData={setData}
                getError={getError}
            />

            <AddressSection data={data} setData={setData} getError={getError} />

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" asChild>
                    <Link href={route('schools.index')}>Cancelar</Link>
                </Button>

                <Button disabled={processing}>Guardar escuela </Button>
            </div>
        </>
    );
}
