import {
    BookImage,
    Camera,
    Coffee,
    Flag,
    Folder,
    Medal,
    SquareUser,
} from 'lucide-react';

export function ProductIcon({ type }: { type: Product['product_type_id'] }) {
    switch (type) {
        case 1: // 1 => mural
            return <BookImage className="h-6 w-6" />;
        case 2: // 2 => taza
            return <Coffee className="h-6 w-6" />;
        case 3: // 3 => banda
            return <Flag className="h-6 w-6" />;
        case 4: // 4 => medalla
            return <Medal className="h-6 w-6" />;
        case 5: // 5 => carpeta
            return <Folder className="h-6 w-6" />;
        case 6: // 6 => foto
            return <Camera className="h-6 w-6" />;
        case 7: // 7 => portaretrato
            return <SquareUser className="h-6 w-6" />;
    }
}
