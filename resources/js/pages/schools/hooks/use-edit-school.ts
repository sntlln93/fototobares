import { getError } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import { type SchoolFormData } from '../form';

export function useEditSchool(
    school: School & { principal?: Principal; address: Address },
) {
    const { data, setData, put, processing, errors } = useForm<SchoolFormData>({
        school: {
            name: school.name,
            level: school.level,
            user_id: school.user_id,
        },
        principal: school.principal
            ? {
                  name: school.principal.name,
                  phone: school.principal.phone,
              }
            : undefined,
        address: {
            street: school.address.street ?? '',
            number: school.address.number ?? '',
            neighborhood: school.address.neighborhood ?? '',
            city: school.address.city,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('schools.update', { school: school.id }));
    };

    const _getError = (path: string) => getError(path, errors);

    return { data, setData, processing, submit, getError: _getError };
}

export type EditSchoolController = ReturnType<typeof useEditSchool>;
