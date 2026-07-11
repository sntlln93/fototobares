import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { OrderFormController } from '../hooks/use-create-order-form';

export function ClientStep({ form }: { form: OrderFormController }) {
    const { data, setData, errors, errorFlags, toStep } = form;

    return (
        <AccordionItem value="client">
            <AccordionTrigger onClick={toStep('client')}>
                <div className="flex items-center gap-2">
                    {errorFlags['client'] && (
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
                        onChange={(e) => setData('name', e.target.value)}
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
                        onChange={(e) => setData('phone', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div className="mt-3">
                    <Label>Nombre del niño</Label>
                    <Input
                        placeholder="Ej: Juan"
                        type="text"
                        id="child_name"
                        name="child_name"
                        value={data.child_name}
                        onChange={(e) => setData('child_name', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.child_name} />
                </div>

                <div className="mt-3">
                    <Label htmlFor="attended_photo_session">
                        ¿Asistió a la sesión de fotos?
                    </Label>
                    <div className="mt-2 flex gap-4">
                        <label className="flex cursor-pointer items-center">
                            <input
                                type="radio"
                                name="attended_photo_session"
                                value="true"
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
                                value="false"
                                checked={data.attended_photo_session === false}
                                onChange={() =>
                                    setData('attended_photo_session', false)
                                }
                                className="mr-2"
                            />
                            No
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    <Button variant="outline" onClick={toStep('schools')}>
                        Anterior
                    </Button>

                    <Button onClick={toStep('products')}>Siguiente</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
