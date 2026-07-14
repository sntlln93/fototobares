import { Badge } from '@/components/ui/badge';
import {
    RectangleHorizontal,
    RectangleVertical,
    Square,
    User,
    Users,
} from 'lucide-react';

/**
 * The mural variant chosen on an order detail, as badges. Accepts both the
 * create-form shape and the loosely-typed variant the API serializes.
 */
export function VariantBadges({
    variant,
}: {
    variant?: {
        color?: string;
        background?: string;
        photo_type?: string;
        orientation?: string;
    };
}) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="gap-1 rounded-lg">
                <Square className="h-4 w-4" style={{ fill: variant?.color }} />
            </Badge>
            <Badge variant="outline" className="rounded-lg">
                {variant?.background}
            </Badge>
            <Badge variant="outline" className="rounded-lg">
                {variant?.photo_type === 'individual' ? (
                    <User className="h-4 w-4" />
                ) : (
                    <Users className="h-4 w-4" />
                )}
            </Badge>
            <Badge variant="outline" className="rounded-lg">
                {variant?.orientation === 'vertical' ? (
                    <RectangleVertical className="h-4 w-4" />
                ) : (
                    <RectangleHorizontal className="h-4 w-4" />
                )}
            </Badge>
        </div>
    );
}
