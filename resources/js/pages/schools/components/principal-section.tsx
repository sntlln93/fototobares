import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SetDataAction } from '@inertiajs/react';
import { type SchoolFormData } from '../form';

interface PrincipalSectionProps {
    data: SchoolFormData;
    setData: SetDataAction<SchoolFormData>;
    getError: (path: string) => string;
}

export function PrincipalSection({
    data,
    setData,
    getError,
}: PrincipalSectionProps) {
    return (
        <section className="mt-6">
            <h2>Director/a</h2>
            <div className="flex gap-6">
                <div className="w-full">
                    <Label htmlFor="principal.name">
                        Nombre de la autoridad
                    </Label>

                    <Input
                        id="principal.name"
                        name="principal.name"
                        value={data.principal?.name ?? ''}
                        onChange={(e) =>
                            setData('principal', {
                                ...data.principal,
                                name: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Nombre la directora o director"
                    />

                    <InputError
                        message={getError('principal.name')}
                        className="mt-2"
                    />
                </div>

                <div className="w-full">
                    <Label htmlFor="principal.phone">
                        Teléfono de la autoridad
                    </Label>

                    <Input
                        id="principal.phone"
                        name="principal.phone"
                        type="text"
                        pattern="[0-9]{10}"
                        value={data.principal?.phone ?? ''}
                        onChange={(e) =>
                            setData('principal', {
                                ...data.principal,
                                phone: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Número de 10 dígitos"
                    />

                    <InputError
                        message={getError('principal.phone')}
                        className="mt-2"
                    />
                </div>
            </div>
        </section>
    );
}
