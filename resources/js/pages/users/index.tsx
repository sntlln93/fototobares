import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalize, cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit2, Plus, Trash } from 'lucide-react';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: route('users.index'),
    },
];

export default function Users({ users }: PageProps<{ users: UserRow[] }>) {
    const { auth } = usePage().props;

    const handleDelete = (user: UserRow) => {
        if (
            confirm(
                `¿Estás seguro de que deseas eliminar al usuario ${user.name}?`,
            )
        ) {
            router.delete(route('users.destroy', { user: user.id }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <section className="p-6">
                <div className="mb-4 flex justify-end">
                    <Link
                        href={route('users.create')}
                        className={cn(buttonVariants())}
                    >
                        <Plus />
                        Agregar usuario
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-25">#</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.id}
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map((role) => (
                                            <Badge
                                                key={role}
                                                variant={
                                                    role === 'master'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {capitalize(role)}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Link
                                        href={route('users.edit', {
                                            user: user.id,
                                        })}
                                        className={cn(
                                            buttonVariants({
                                                size: 'sm',
                                                variant: 'warning',
                                            }),
                                        )}
                                    >
                                        <Edit2 />
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={user.id === auth.user.id}
                                        title={
                                            user.id === auth.user.id
                                                ? 'No podés eliminar tu propio usuario'
                                                : 'Eliminar usuario'
                                        }
                                        onClick={() => handleDelete(user)}
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </AppLayout>
    );
}
