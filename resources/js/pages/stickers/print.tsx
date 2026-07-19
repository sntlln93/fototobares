import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Sticker, StickerOrder } from './components/sticker';

const PER_SHEET = 10;

/**
 * Print-only page (no AppLayout): a ready-to-print A4 grid of order labels,
 * 10 per sheet (2 columns x 5 rows). Opened in a new tab from `/stickers`.
 */
export default function StickersPrint({
    orders,
}: PageProps<{ orders: StickerOrder[] }>) {
    const sheets: StickerOrder[][] = [];

    for (let i = 0; i < orders.length; i += PER_SHEET) {
        sheets.push(orders.slice(i, i + PER_SHEET));
    }

    return (
        <>
            <Head title="Etiquetas" />

            <div className="flex flex-col items-center gap-4 bg-gray-100 p-6 print:bg-white print:p-0">
                <Button className="print:hidden" onClick={() => window.print()}>
                    <Printer />
                    Imprimir
                </Button>

                <div className="w-full overflow-auto">
                    {sheets.map((sheet, index) => (
                        <div
                            key={index}
                            className="mx-auto grid w-fit break-after-page grid-cols-2 grid-rows-5 bg-white last:break-after-auto"
                        >
                            {sheet.map((order) => (
                                <Sticker key={order.id} order={order} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
