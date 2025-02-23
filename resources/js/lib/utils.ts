import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * This should be typesafe
 */
export function getError(key: string, errors: Record<string, string>) {
    const err = errors;
    /*
    Errors { [key:keyof errors]: string | {[key: keyof errors]: string} }
    */

    return err[key];
}
