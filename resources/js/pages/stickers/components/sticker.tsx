import { cn } from '@/lib/utils';
import { variantSummary } from '@/lib/variants';
import { useState } from 'react';

export interface StickerOrder {
    id: number;
    order_number: number;
    child_name: string | null;
    school_name: string;
    classroom_name: string;
    photo_url: string | null;
    products: { name: string; variant: VariantSnapshotEntry[] | null }[];
}

/**
 * One 10x5cm order label: photo, name, school/classroom, order number, year
 * and the product list. The photo strip width follows the image's own
 * dimensions (naturalWidth/naturalHeight), not the "Orientación" variant.
 */
export function Sticker({ order }: { order: StickerOrder }) {
    const [landscape, setLandscape] = useState(true);
    const year = new Date().getFullYear();

    return (
        <div className="sticker flex h-[5cm] w-[10cm] overflow-hidden border border-dashed border-gray-300 bg-white text-black">
            <div
                className={cn(
                    'shrink-0 overflow-hidden bg-gray-100',
                    landscape ? 'w-[45%]' : 'w-[32%]',
                )}
            >
                {order.photo_url ? (
                    <img
                        src={order.photo_url}
                        alt={order.child_name ?? 'Foto'}
                        className="h-full w-full object-cover"
                        onLoad={(event) => {
                            const img = event.currentTarget;
                            setLandscape(img.naturalWidth >= img.naturalHeight);
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-[6pt] text-gray-400">
                        Sin foto
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-2 text-[7pt] leading-tight">
                <div>
                    <p className="truncate font-semibold">
                        {order.child_name ?? 'Sin nombre'}
                    </p>
                    <p className="truncate text-gray-600">
                        {order.school_name} ({order.classroom_name})
                    </p>
                    <p className="text-gray-600">
                        N° {order.order_number} · {year}
                    </p>
                </div>

                <ul className="min-w-0 space-y-0.5">
                    {order.products.map((product, index) => (
                        <li key={index} className="truncate">
                            {product.name}
                            {product.variant &&
                                product.variant.length > 0 &&
                                ` — ${variantSummary(product.variant)}`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
