import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export function EditClassroom({
    classroom,
    show,
    onClose,
}: {
    classroom: Classroom;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { put, data, setData, processing, errors } = useForm({
        name: classroom.name,
        teacher: classroom.teacher?.name ?? '',
        phone: classroom.teacher?.phone ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('classrooms.update', { classroom: classroom.id }), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Modificar curso
                </h2>

                <div className="flex flex-col gap-2 py-4">
                    <Label htmlFor="name">Curso</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="h-10"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="flex flex-col gap-2 py-4">
                    <Label htmlFor="teacher">Mastro/a</Label>
                    <Input
                        id="teacher"
                        name="teacher"
                        type="text"
                        value={data.teacher}
                        onChange={(e) => setData('teacher', e.target.value)}
                        className="h-10"
                    />
                    <InputError message={errors.teacher} className="mt-2" />
                </div>
                <div className="flex flex-col gap-2 py-4">
                    <Label htmlFor="phone">Teléfono del maestro</Label>
                    <InputHint message="Un número de teléfono válido contiene sólo 10 dígitos" />
                    <Input
                        id="phone"
                        name="phone"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="h-10"
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button disabled={processing}>Modificar curso</Button>
                </div>
            </form>
        </Modal>
    );
}
