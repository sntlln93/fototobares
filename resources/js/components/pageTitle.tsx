import { PropsWithChildren } from 'react';

export function PageTitle({ children }: PropsWithChildren) {
    return (
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
            {children}
        </h2>
    );
}
