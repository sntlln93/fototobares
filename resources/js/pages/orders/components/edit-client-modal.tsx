import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { FormEventHandler } from 'react';
import { EditClientFormController } from '../hooks/use-edit-client-form';

export function EditClientModal({
    show,
    onClose,
    form,
}: {
    show: boolean;
    onClose: () => void;
    form: EditClientFormController;
}) {
    const { data, setData, errors, processing, submit } = form;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        submit(e);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Editar datos del cliente
                </h2>

                <div className="mt-4">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Agustín Perez"
                        value={data.name || ''}
                        onChange={(e) =>
                            setData('name', e.target.value || null)
                        }
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="mt-4">
                    <Label htmlFor="phone">Teléfono</Label>
                    <InputHint
                        className="mt-2"
                        message="Un número de teléfono válido contiene sólo 10 dígitos"
                    />
                    <Input
                        id="phone"
                        type="text"
                        placeholder="3804125834"
                        value={data.phone || ''}
                        onChange={(e) =>
                            setData('phone', e.target.value || null)
                        }
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div className="mt-4">
                    <Label htmlFor="child_name">Nombre del niño</Label>
                    <Input
                        id="child_name"
                        type="text"
                        placeholder="Ej: Juan"
                        value={data.child_name || ''}
                        onChange={(e) =>
                            setData('child_name', e.target.value || null)
                        }
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.child_name} />
                </div>

                <div className="mt-4">
                    <Label htmlFor="attended_photo_session">
                        ¿Asistió a la sesión de fotos?
                    </Label>
                    <div className="mt-2 flex gap-4">
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="attended_photo_session"
                                checked={data.attended_photo_session === true}
                                onChange={() =>
                                    setData('attended_photo_session', true)
                                }
                                className="mr-2"
                            />
                            Sí
                        </label>
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="attended_photo_session"
                                checked={data.attended_photo_session === false}
                                onChange={() =>
                                    setData('attended_photo_session', false)
                                }
                                className="mr-2"
                            />
                            No
                        </label>
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="attended_photo_session"
                                checked={data.attended_photo_session === null}
                                onChange={() =>
                                    setData('attended_photo_session', null)
                                }
                                className="mr-2"
                            />
                            Sin definir
                        </label>
                    </div>
                    <InputError message={errors.attended_photo_session} />
                </div>

                <div className="mt-6 grid grid-cols-[1fr_1fr] gap-2">
                    <Button
                        disabled={processing}
                        variant="outline"
                        onClick={onClose}
                        type="button"
                    >
                        Cancelar
                    </Button>

                    <Button disabled={processing}>
                        {processing ? <Spinner /> : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
