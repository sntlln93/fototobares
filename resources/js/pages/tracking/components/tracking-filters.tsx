import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { capitalize } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useState } from 'react';

export type Filters = {
    search: string | null;
    school_id: number | null;
    classroom_id: number | null;
    product_type_id: string | null;
    production_status_id: string | null;
};

export type SchoolWithClassrooms = {
    id: number;
    name: string;
    classrooms: Array<{ id: number; name: string; school_id: number }>;
};

export function TrackingFilters({
    filters,
    schools,
    productTypes,
    onApply,
}: {
    filters: Filters;
    schools: SchoolWithClassrooms[];
    productTypes: ProductType[];
    onApply: (overrides: Partial<Filters> & { search?: string }) => void;
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    // A classroom implies its school, so the school select also reflects
    // visits that only carried classroom_id
    const selectedSchool =
        schools.find((school) => school.id === filters.school_id) ??
        schools.find((school) =>
            school.classrooms.some(
                (classroom) => classroom.id === filters.classroom_id,
            ),
        );

    const classroomItems = selectedSchool
        ? selectedSchool.classrooms.map((classroom) => ({
              id: classroom.id,
              label: classroom.name,
          }))
        : schools.flatMap((school) =>
              school.classrooms.map((classroom) => ({
                  id: classroom.id,
                  label: `${school.name} — ${classroom.name}`,
              })),
          );

    return (
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
            <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    onApply({ search });
                }}
            >
                <Input
                    placeholder="Niño, cliente o n° de pedido"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="min-w-0 flex-1 md:w-64 md:flex-none"
                />
                <Button type="submit" variant="secondary" size="icon">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            <Select
                value={selectedSchool ? String(selectedSchool.id) : 'all'}
                onValueChange={(value) =>
                    // Changing school invalidates any classroom filter
                    onApply({
                        search,
                        school_id: value === 'all' ? null : Number(value),
                        classroom_id: null,
                    })
                }
            >
                <SelectTrigger className="md:w-56">
                    <SelectValue placeholder="Escuela" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las escuelas</SelectItem>
                    {schools.map((school) => (
                        <SelectItem value={String(school.id)} key={school.id}>
                            {school.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={
                    filters.classroom_id ? String(filters.classroom_id) : 'all'
                }
                onValueChange={(value) =>
                    onApply({
                        search,
                        classroom_id: value === 'all' ? null : Number(value),
                    })
                }
            >
                <SelectTrigger className="md:w-56">
                    <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los cursos</SelectItem>
                    {classroomItems.map((classroom) => (
                        <SelectItem
                            value={String(classroom.id)}
                            key={classroom.id}
                        >
                            {classroom.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={
                    filters.product_type_id
                        ? String(filters.product_type_id)
                        : 'all'
                }
                onValueChange={(value) =>
                    onApply({
                        search,
                        product_type_id: value === 'all' ? null : value,
                    })
                }
            >
                <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Tipo de producto" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {productTypes.map((type) => (
                        <SelectItem value={String(type.id)} key={type.id}>
                            {capitalize(type.name)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
