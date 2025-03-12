import {
    RectangleHorizontal,
    RectangleVertical,
    User,
    Users,
} from 'lucide-react';

export function ProductDesign({ variants }: { variants: Product['variants'] }) {
    return (
        <div className="flex gap-1">
            {variants.photo_types?.length > 0 &&
                variants.photo_types.map((photoType) =>
                    photoType === 'individual' ? (
                        <User key={photoType} />
                    ) : (
                        <Users key={photoType} />
                    ),
                )}
            {variants.orientations?.map((orientation) =>
                orientation === 'vertical' ? (
                    <RectangleVertical key={orientation} />
                ) : (
                    <RectangleHorizontal key={orientation} />
                ),
            )}
        </div>
    );
}
