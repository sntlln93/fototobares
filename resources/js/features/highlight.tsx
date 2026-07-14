import { highlightPhoneSegments, highlightSegments } from '@/lib/highlight';

interface HighlightProps {
    text: string;
    /** The active search term, as echoed back by the page's `filters`. */
    term?: string | null;
    /** Match the term digit by digit, ignoring separators and the +549 prefix. */
    phone?: boolean;
}

/**
 * Renders a table cell's text with the part matching the current search
 * term marked, so the reason a row came up is visible at a glance.
 */
export function Highlight({ text, term, phone = false }: HighlightProps) {
    const segments = phone
        ? highlightPhoneSegments(text, term)
        : highlightSegments(text, term);

    return (
        <>
            {segments.map((segment, index) =>
                segment.match ? (
                    <mark
                        key={index}
                        className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-500/40"
                    >
                        {segment.text}
                    </mark>
                ) : (
                    <span key={index}>{segment.text}</span>
                ),
            )}
        </>
    );
}
