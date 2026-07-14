import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Column count per viewport width. Mirrors the lg/2xl Tailwind breakpoints.
 */
export function columnsFor(width: number): number {
    if (width >= 1536) return 3;
    if (width >= 1024) return 2;
    return 1;
}

/**
 * Assigns each item to the shortest column so far. CSS can only split a list of
 * cards in source order (that is what `columns-*` and column wrappers do), which
 * strands short cards next to a tall neighbour; picking the shortest column is
 * what keeps the columns even.
 */
export function assignToShortestColumn(
    heights: number[],
    columns: number,
): number[] {
    const totals: number[] = new Array(columns).fill(0);

    return heights.map((height) => {
        let target = 0;
        for (let column = 1; column < columns; column++) {
            if (totals[column] < totals[target]) target = column;
        }

        totals[target] += height;

        return target;
    });
}

function sameAssignment(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((column, i) => column === b[i]);
}

/**
 * Distributes `keys` over a responsive number of columns, keeping the columns as
 * even as possible. Returns the column each key belongs to, plus the ref
 * callback that has to be attached to every item so it can be measured.
 */
export function useMasonry(keys: string[]) {
    const [columns, setColumns] = useState(1);
    const [assignment, setAssignment] = useState<number[]>([]);
    const nodes = useRef(new Map<string, HTMLElement>());

    useLayoutEffect(() => {
        const readWidth = () => setColumns(columnsFor(window.innerWidth));

        readWidth();
        window.addEventListener('resize', readWidth);

        return () => window.removeEventListener('resize', readWidth);
    }, []);

    // No dependency array: items change parent when they are reassigned, which
    // remounts their nodes, so the observer has to be re-attached every render.
    useLayoutEffect(() => {
        const measure = () => {
            const heights = keys.map(
                (key) => nodes.current.get(key)?.offsetHeight ?? 0,
            );

            const next = assignToShortestColumn(heights, columns);

            setAssignment((current) =>
                sameAssignment(current, next) ? current : next,
            );
        };

        const observer = new ResizeObserver(measure);
        nodes.current.forEach((node) => observer.observe(node));
        measure();

        return () => observer.disconnect();
    });

    const register = (key: string) => (node: HTMLElement | null) => {
        if (node) {
            nodes.current.set(key, node);
        } else {
            nodes.current.delete(key);
        }
    };

    const columnsOfKeys: string[][] = Array.from(
        { length: columns },
        () => [] as string[],
    );

    // On the render right after the viewport shrinks the assignment still points
    // at columns that no longer exist; clamping keeps the cards on screen until
    // the layout effect below re-measures them.
    keys.forEach((key, index) => {
        const column = Math.min(assignment[index] ?? 0, columns - 1);

        columnsOfKeys[column].push(key);
    });

    return { columns: columnsOfKeys, register };
}
