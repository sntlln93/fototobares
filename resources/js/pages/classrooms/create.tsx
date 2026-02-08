import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export function CreateClassroom({
    school,
    show,
    onClose,
}: {
    school: School;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { post, data, setData, processing, errors } = useForm({
        name: '',
        teacher: '',
        phone: '',
        school_id: school.id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('classrooms.store'), {
            onSuccess: () => onClose(),
        });
    };
    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar nuevo curso
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
                    <InputError message={errors.name} />
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
                    <InputError message={errors.teacher} />
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
                    <InputError message={errors.phone} />
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

                    <Button disabled={processing}>Agregar curso</Button>
                </div>
            </form>
        </Modal>
    );
}
