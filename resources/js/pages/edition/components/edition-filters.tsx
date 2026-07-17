import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { FilterOption } from '../hooks/use-edition-filters';

const ALL = 'all';

export function EditionFilters({
    canManage,
    search,
    onSearchChange,
    schoolId,
    onSchoolChange,
    classroomId,
    onClassroomChange,
    editorId,
    onEditorChange,
    productName,
    onProductChange,
    schoolOptions,
    classroomOptions,
    editorOptions,
    productOptions,
}: {
    canManage: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    schoolId: number | null;
    onSchoolChange: (value: number | null) => void;
    classroomId: number | null;
    onClassroomChange: (value: number | null) => void;
    editorId: number | null;
    onEditorChange: (value: number | null) => void;
    productName: string | null;
    onProductChange: (value: string | null) => void;
    schoolOptions: FilterOption[];
    classroomOptions: FilterOption[];
    editorOptions: FilterOption[];
    productOptions: string[];
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 md:w-64 md:flex-none">
                <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por foto, niño o diseño"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                />
            </div>

            <Select
                value={schoolId !== null ? String(schoolId) : ALL}
                onValueChange={(value) =>
                    onSchoolChange(value === ALL ? null : Number(value))
                }
            >
                <SelectTrigger className="min-w-0 md:w-48">
                    <SelectValue placeholder="Escuela" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Todas las escuelas</SelectItem>
                    {schoolOptions.map((school) => (
                        <SelectItem value={String(school.id)} key={school.id}>
                            {school.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={classroomId !== null ? String(classroomId) : ALL}
                onValueChange={(value) =>
                    onClassroomChange(value === ALL ? null : Number(value))
                }
            >
                <SelectTrigger className="min-w-0 md:w-48">
                    <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Todos los cursos</SelectItem>
                    {classroomOptions.map((classroom) => (
                        <SelectItem
                            value={String(classroom.id)}
                            key={classroom.id}
                        >
                            {classroom.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {canManage && (
                <Select
                    value={editorId !== null ? String(editorId) : ALL}
                    onValueChange={(value) =>
                        onEditorChange(value === ALL ? null : Number(value))
                    }
                >
                    <SelectTrigger className="min-w-0 md:w-48">
                        <SelectValue placeholder="Editor asignado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Todos los editores</SelectItem>
                        {editorOptions.map((editor) => (
                            <SelectItem
                                value={String(editor.id)}
                                key={editor.id}
                            >
                                {editor.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select
                value={productName ?? ALL}
                onValueChange={(value) =>
                    onProductChange(value === ALL ? null : value)
                }
            >
                <SelectTrigger className="min-w-0 md:w-48">
                    <SelectValue placeholder="Producto con foto" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>Todos los productos</SelectItem>
                    {productOptions.map((product) => (
                        <SelectItem value={product} key={product}>
                            {product}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
