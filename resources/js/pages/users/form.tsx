import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalize } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export type UserFormData = {
    name: string;
    email: string;
    password: string;
    roles: number[];
};

export function UserForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    roles,
    isEdit = false,
}: {
    data: UserFormData;
    setData: <K extends keyof UserFormData>(
        key: K,
        value: UserFormData[K],
    ) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    roles: Array<{ id: number; name: string }>;
    isEdit?: boolean;
}) {
    return (
        <form
            className="flex max-w-xl flex-col gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.name} />
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.email} />
            </div>

            <div>
                <Label htmlFor="password">
                    {isEdit ? 'Nueva contraseña' : 'Contraseña'}
                </Label>
                {isEdit && (
                    <InputHint
                        className="text-xs"
                        message="Dejar vacío para mantener la contraseña actual"
                    />
                )}
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.password} />
            </div>

            <fieldset>
                <legend className="text-sm font-medium">Roles</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                    {roles.map((role) => (
                        <label
                            key={role.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={data.roles.includes(role.id)}
                                onChange={(e) =>
                                    setData(
                                        'roles',
                                        e.target.checked
                                            ? [...data.roles, role.id]
                                            : data.roles.filter(
                                                  (id) => id !== role.id,
                                              ),
                                    )
                                }
                            />
                            {capitalize(role.name)}
                        </label>
                    ))}
                </div>
                <InputError message={errors.roles} />
            </fieldset>

            <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={route('users.index')}>Cancelar</Link>
                </Button>
                <Button disabled={processing}>
                    {isEdit ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
            </div>
        </form>
    );
}
