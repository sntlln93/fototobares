import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function InputHint({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={cn(
                'text-sm text-gray-500 dark:text-gray-100',
                className,
            )}
        >
            {message}
        </p>
    ) : null;
}
