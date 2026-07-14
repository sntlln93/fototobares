import { buttonVariants } from '@/components/ui/button';
import { Highlight } from '@/features/highlight';
import { cn } from '@/lib/utils';
import { waChatUrl } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';

interface PhoneLinkProps {
    phone?: string | null;
    /** The active search term, so the matched digits show up marked. */
    term?: string | null;
}

/**
 * A client's phone with a button that opens their WhatsApp chat — the way
 * the studio actually contacts people. Numbers that cannot be dialed
 * (missing or too short) render as plain text, with no button.
 */
export function PhoneLink({ phone, term }: PhoneLinkProps) {
    if (!phone) {
        return <span className="text-muted-foreground">N/A</span>;
    }

    const chat = waChatUrl(phone);

    return (
        <span className="flex items-center gap-1 whitespace-nowrap">
            <Highlight text={phone} term={term} phone />
            {chat && (
                <a
                    href={chat}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Abrir chat de WhatsApp con ${phone}`}
                    aria-label={`Abrir chat de WhatsApp con ${phone}`}
                    className={cn(
                        buttonVariants({ size: 'icon', variant: 'ghost' }),
                        'size-7 text-green-600 hover:text-green-700',
                    )}
                >
                    <MessageCircle className="size-4" />
                </a>
            )}
        </span>
    );
}
