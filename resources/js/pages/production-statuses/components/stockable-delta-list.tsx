import { Fragment } from 'react';
import { StageStockable } from '../hooks/use-status-actions';
import { StockableDelta } from './stockable-delta';

export function StockableDeltaList({
    stockables,
}: {
    stockables: StageStockable[];
}) {
    if (stockables.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-x-1.5 text-xs">
            {stockables.map((stockable, index) => (
                <Fragment key={stockable.id}>
                    {index > 0 && <span className="text-gray-400">·</span>}
                    <StockableDelta
                        quantity={stockable.quantity}
                        name={stockable.name}
                    />
                </Fragment>
            ))}
        </div>
    );
}
