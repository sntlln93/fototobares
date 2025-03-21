import { PaginationNav } from '@/components/paginationNav';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Searchbar } from '@/features/searchbar';
import AppLayout from '@/layouts/app-layout';
import { onSort } from '@/lib/services/filter';
import { formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpDown, Edit2, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteComboConfirmation } from './partials/delete-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Combos',
        href: route('combos.index'),
    },
];

export default function Combos({
    combos,
}: PageProps<Paginated<Combo & { products: Product[] }>>) {
    const [deleteableCombo, setDeleteableCombo] = useState<Combo | null>(null);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Combos" />

            {deleteableCombo && (
                <DeleteComboConfirmation
                    combo={deleteableCombo}
                    show={Boolean(deleteableCombo)}
                    onClose={() => setDeleteableCombo(null)}
                />
            )}

            <section className="p-6">
                <div className="mb-4 flex justify-between">
                    <Searchbar indexRoute="combos.index" />

                    <Button asChild>
                        <Link href={route('combos.create')}>
                            <Plus />
                            Agregar combo
                        </Link>
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('id', 'combos.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    #
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('name', 'combos.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Combo
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onSort('unit_price', 'combos.index')
                                        }
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </button>
                                    Precio
                                </div>
                            </TableHead>
                            <TableHead>Cuotas máximas</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {combos.data.map((combo) => (
                            <TableRow key={combo.id}>
                                <TableCell className="font-medium">
                                    {combo.id}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    {combo.name}
                                </TableCell>
                                <TableCell>
                                    {formatPrice(combo.suggested_price)}
                                </TableCell>
                                <TableCell>
                                    {combo.suggested_max_payments}
                                </TableCell>
                                <TableCell>
                                    {`${combo.products.length} productos`}
                                </TableCell>

                                <TableCell className="flex gap-2">
                                    <Link
                                        className={buttonVariants({
                                            variant: 'warning',
                                            size: 'sm',
                                        })}
                                        href={route('combos.edit', {
                                            combo: combo.id,
                                        })}
                                    >
                                        <Edit2 />
                                    </Link>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                        onClick={() =>
                                            setDeleteableCombo(combo)
                                        }
                                    >
                                        <Trash />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationNav links={combos.meta.links} />
            </section>
        </AppLayout>
    );
}
