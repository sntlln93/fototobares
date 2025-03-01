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
            className={cn('text-sm text-muted dark:text-muted', className)}
        >
            {message}
        </p>
    ) : null;
}
