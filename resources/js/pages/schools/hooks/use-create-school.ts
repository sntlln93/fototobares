import { getError } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import { type SchoolFormData } from '../form';

export function useCreateSchool() {
    const { data, setData, post, processing, errors } = useForm<SchoolFormData>(
        {
            school: {
                name: '',
                level: 'Primaria',
            },
            address: { city: 'La Rioja' },
        },
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('schools.store'));
    };

    const _getError = (path: string) => getError(path, errors);

    return { data, setData, processing, submit, getError: _getError };
}

export type CreateSchoolController = ReturnType<typeof useCreateSchool>;
