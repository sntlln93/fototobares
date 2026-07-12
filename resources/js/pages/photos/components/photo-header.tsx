import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface PhotoHeaderProps {
    classroom: Classroom & { school: School };
}

export function PhotoHeader({ classroom }: PhotoHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link
                    href={route('schools.show', {
                        school: classroom.school.id,
                    })}
                >
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Fotos - {classroom.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {classroom.school.name}
                    </p>
                </div>
            </div>
        </div>
    );
}
