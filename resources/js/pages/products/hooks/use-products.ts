import { useState } from 'react';

export function useProducts() {
    const [deleteableProduct, setDeleteableProduct] = useState<Product | null>(
        null,
    );

    return { deleteableProduct, setDeleteableProduct };
}
