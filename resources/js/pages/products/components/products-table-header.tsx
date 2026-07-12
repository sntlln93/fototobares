import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { onSort } from '@/lib/services/filter';
import { ArrowUpDown } from 'lucide-react';

export function ProductsTableHeader() {
    return (
        <TableHeader>
            <TableRow>
                <TableHead className="w-25">
                    <div className="flex items-center gap-2">
                        <button onClick={() => onSort('id', 'products.index')}>
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        #
                    </div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onSort('name', 'products.index')}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        Producto
                    </div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                onSort('financed_price', 'products.index')
                            }
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        Precio individual
                    </div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                onSort('unit_price', 'products.index')
                            }
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        1 Pago con descuento
                    </div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">
                        Cuotas máximas
                    </div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">Medidas</div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">Diseño</div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">Fondos</div>
                </TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">Colores</div>
                </TableHead>
                <TableHead>Acciones</TableHead>
            </TableRow>
        </TableHeader>
    );
}
