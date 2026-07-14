import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Edit, ShoppingCart } from 'lucide-react';
import { type SchoolShowData } from '../hooks/use-school-show';

export function SchoolInfoCard({ school }: { school: SchoolShowData }) {
    return (
        <section className="px-6 pt-6">
            <Card className="relative max-w-106.25">
                <div className="absolute top-4 right-4 flex gap-2">
                    <Link
                        href={route('orders.index', {
                            school_id: school.id,
                        })}
                        className={cn(
                            buttonVariants({
                                size: 'sm',
                                variant: 'outline',
                            }),
                        )}
                    >
                        <ShoppingCart />
                        Ver pedidos
                    </Link>
                    <Link
                        href={route('schools.edit', {
                            school: school.id,
                        })}
                        className={cn(
                            buttonVariants({
                                size: 'sm',
                                variant: 'warning',
                            }),
                        )}
                    >
                        <Edit />
                    </Link>
                </div>
                <CardHeader>
                    <CardDescription>{school.user.name}</CardDescription>
                    <CardTitle>
                        {school.level} {school.name}
                    </CardTitle>
                    {school.principal && (
                        <CardDescription>
                            {school.principal.name}
                        </CardDescription>
                    )}
                    <span>{school.full_address}</span>
                </CardHeader>
            </Card>
        </section>
    );
}
