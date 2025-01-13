import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

export function Card({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                    <div
                        className={cn(
                            'p-6 text-gray-900 dark:text-gray-100',
                            className,
                        )}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
