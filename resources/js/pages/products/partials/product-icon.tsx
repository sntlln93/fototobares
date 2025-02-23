import { BookImage, Coffee, Medal, Ribbon } from 'lucide-react';

export function ProductIcon({ type }: { type: Product['type'] }) {
    switch (type) {
        case 'mural':
            return <BookImage className="h-6 w-6" />;
        case 'banda':
            return <Ribbon className="h-6 w-6" />;
        case 'medalla':
            return <Medal className="h-6 w-6" />;
        case 'taza':
            return <Coffee className="h-6 w-6" />;
    }
}
