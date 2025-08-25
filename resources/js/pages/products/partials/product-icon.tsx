import {
    BookImage,
    Camera,
    Coffee,
    Flag,
    Folder,
    Medal,
    SquareUser,
} from 'lucide-react';

export function ProductIcon({
    type,
    className,
}: {
    type: Product['product_type_id'];
    className?: string;
}) {
    const classes = className ? className : 'h-6 w-6';

    switch (type) {
        case 1: // 1 => mural
            return <BookImage className={classes} />;
        case 2: // 2 => taza
            return <Coffee className={classes} />;
        case 3: // 3 => banda
            return <Flag className={classes} />;
        case 4: // 4 => medalla
            return <Medal className={classes} />;
        case 5: // 5 => carpeta
            return <Folder className={classes} />;
        case 6: // 6 => foto
            return <Camera className={classes} />;
        case 7: // 7 => portaretrato
            return <SquareUser className={classes} />;
    }
}
