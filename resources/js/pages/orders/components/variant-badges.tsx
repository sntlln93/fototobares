import { Badge } from '@/components/ui/badge';

/**
 * A detail's variant snapshot, as badges. A null value means the variant is
 * nullable and still pending definition (#113).
 */
export function VariantBadges({
    variant,
}: {
    variant?: VariantSnapshotEntry[];
}) {
    if (!variant?.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            {variant.map((entry) =>
                entry.value === null ? (
                    <Badge variant="outline" key={entry.label}>
                        A definir: {entry.label}
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="gap-1"
                        key={entry.label}
                    >
                        {entry.value.color && (
                            <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: entry.value.color }}
                            />
                        )}
                        {entry.value.label}
                    </Badge>
                ),
            )}
        </div>
    );
}
