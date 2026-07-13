import InputError from '@/components/input-error';
import { Link } from '@inertiajs/react';

const ORDER_REFERENCE = /pedido #(\d+)/;

/**
 * Renders the transaction number validation error; when the backend
 * reports a duplicate ("... en el pedido #N"), the order becomes a link.
 */
export function TransactionNumberError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    const match = message.match(ORDER_REFERENCE);

    if (!match || match.index === undefined) {
        return <InputError message={message} />;
    }

    const orderId = Number(match[1]);

    return (
        <p className="text-sm text-red-600 dark:text-red-400">
            {message.slice(0, match.index)}
            <Link
                href={route('orders.show', { order: orderId })}
                className="font-medium underline"
            >
                pedido #{orderId}
            </Link>
            {message.slice(match.index + match[0].length)}
        </p>
    );
}
