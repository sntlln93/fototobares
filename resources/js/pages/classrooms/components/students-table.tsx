import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Highlight } from '@/features/highlight';
import { InstallmentsIndicator } from '@/features/installments-indicator';
import { PhoneLink } from '@/features/phone-link';
import { cn, formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export interface ClassroomStudent {
    kind: 'order' | 'draft';
    id: number;
    photo_number: number | null;
    child_name: string | null;
    client_name: string | null;
    client_phone: string | null;
    products_count: number;
    total_price: number;
    payment_plan: number;
    paid_installments: number;
    current_installment_fraction: number;
    due_date: string | null;
}

interface StudentsTableProps {
    students: ClassroomStudent[];
    /** The applied search term, marked in the columns it matched. */
    search?: string | null;
}

export function StudentsTable({ students, search }: StudentsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-25">N° de orden</TableHead>
                    <TableHead>Nombre del Niño</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Acción</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student) => (
                    <TableRow key={`${student.kind}-${student.id}`}>
                        <TableCell className="font-medium">
                            {student.photo_number != null ? (
                                <Highlight
                                    text={String(student.photo_number)}
                                    term={search}
                                />
                            ) : (
                                '—'
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {student.child_name ? (
                                    <Highlight
                                        text={student.child_name}
                                        term={search}
                                    />
                                ) : (
                                    '—'
                                )}
                                {student.kind === 'draft' && (
                                    <Badge variant="secondary">Borrador</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            {student.client_name ? (
                                <Highlight
                                    text={student.client_name}
                                    term={search}
                                />
                            ) : (
                                'Sin especificar'
                            )}
                        </TableCell>
                        <TableCell>
                            <PhoneLink
                                phone={student.client_phone}
                                term={search}
                            />
                        </TableCell>
                        <TableCell>{student.products_count}</TableCell>
                        <TableCell>
                            {student.payment_plan > 0 ? (
                                <div className="flex flex-col gap-1">
                                    <span>
                                        {student.payment_plan} (
                                        {formatPrice(
                                            student.total_price /
                                                student.payment_plan,
                                        )}
                                        )
                                    </span>
                                    <InstallmentsIndicator
                                        paymentPlan={student.payment_plan}
                                        paidInstallments={
                                            student.paid_installments
                                        }
                                        currentInstallmentFraction={
                                            student.current_installment_fraction
                                        }
                                    />
                                </div>
                            ) : (
                                '—'
                            )}
                        </TableCell>
                        <TableCell>{student.due_date ?? '—'}</TableCell>
                        <TableCell>
                            {student.kind === 'draft' ? (
                                <Link
                                    className={cn(
                                        buttonVariants({
                                            size: 'sm',
                                            variant: 'outline',
                                        }),
                                    )}
                                    href={route('orders.create', {
                                        draft: student.id,
                                    })}
                                >
                                    Completar pedido
                                </Link>
                            ) : (
                                <Link
                                    className={cn(
                                        buttonVariants({
                                            size: 'sm',
                                            variant: 'outline',
                                        }),
                                    )}
                                    href={route('orders.show', {
                                        order: student.id,
                                    })}
                                >
                                    Ver
                                </Link>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
