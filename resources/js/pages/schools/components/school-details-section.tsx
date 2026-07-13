import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type SetDataAction } from '@inertiajs/react';
import { type SchoolFormData } from '../form';

interface SchoolDetailsSectionProps {
    data: SchoolFormData;
    setData: SetDataAction<SchoolFormData>;
    getError: (path: string) => string;
    users: User[];
    levelDefaultValue: string;
    levelErrorPath: string;
    encargadoValue?: string;
}

export function SchoolDetailsSection({
    data,
    setData,
    getError,
    users,
    levelDefaultValue,
    levelErrorPath,
    encargadoValue,
}: SchoolDetailsSectionProps) {
    return (
        <section className="mt-6">
            <h2>Escuela</h2>
            <div className="flex items-end gap-2">
                <div className="w-full">
                    <Label htmlFor="school.name">Nombre de la escuela</Label>

                    <Input
                        id="school.name"
                        type="text"
                        name="school.name"
                        value={data.school.name}
                        onChange={(e) =>
                            setData('school', {
                                ...data.school,
                                name: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Nombre de la escuela"
                    />

                    <InputError
                        message={getError('school.name')}
                        className="mt-2"
                    />
                </div>

                <div className="w-full">
                    <Label htmlFor="level">Nivel</Label>
                    <Select
                        name="level"
                        onValueChange={(value) =>
                            setData('school', {
                                ...data.school,
                                level: value,
                            })
                        }
                        defaultValue={levelDefaultValue}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Jardín">Jardín</SelectItem>
                            <SelectItem value="Primaria">Primaria</SelectItem>
                            <SelectItem value="Secundaria">
                                Secundaria
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <InputError
                        message={getError(levelErrorPath)}
                        className="mt-2"
                    />
                </div>
            </div>

            <div className="mt-6">
                <Label htmlFor="'school.user_id'">Encargado</Label>
                <Select
                    name="'school.user_id'"
                    value={encargadoValue}
                    onValueChange={(value) =>
                        setData('school', {
                            ...data.school,
                            user_id: Number(value),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <InputError
                    message={getError('school.user_id')}
                    className="mt-2"
                />
            </div>
        </section>
    );
}
