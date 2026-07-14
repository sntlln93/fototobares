import { Masonry, MasonryItem } from '@/components/masonry';
import { assignToShortestColumn, columnsFor } from '@/hooks/use-masonry';
import { act, render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

// jsdom lays nothing out, so every element reports offsetHeight 0. The masonry
// measures the wrapper it puts around each item, so the fake height is read from
// the item it wraps.
beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get(this: HTMLElement) {
            const child = this.firstElementChild as HTMLElement | null;

            return Number(child?.dataset.height ?? 0);
        },
    });
});

function setWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
    });
}

function card(key: string, height: number): MasonryItem {
    return {
        key,
        content: (
            <div data-testid={key} data-height={height}>
                {key}
            </div>
        ),
    };
}

/** The keys of each column, in the order they are painted. */
function columnsOf(container: HTMLElement): string[][] {
    const root = container.firstElementChild as HTMLElement;

    return Array.from(root.children).map((column) =>
        Array.from(column.querySelectorAll<HTMLElement>('[data-testid]')).map(
            (item) => item.dataset.testid ?? '',
        ),
    );
}

// The heights the real order page produces: a short client card, a very tall
// detail card, and three middling ones.
const ORDER_CARDS = [
    card('info', 300),
    card('details', 671),
    card('delivery', 352),
    card('payments', 186),
    card('notes', 372),
];

describe('assignToShortestColumn', () => {
    it('keeps the source order in a single column', () => {
        expect(assignToShortestColumn([300, 671, 352], 1)).toEqual([0, 0, 0]);
    });

    it('sends each item to the column that is shortest so far', () => {
        // 300 -> c0 (0); 671 -> c1 (0); 352 -> c0 (300 < 671); 186 -> c0 (652 <
        // 671); 372 -> c1 (671 < 838)
        expect(assignToShortestColumn([300, 671, 352, 186, 372], 2)).toEqual([
            0, 1, 0, 0, 1,
        ]);
    });

    it('breaks ties towards the leftmost column, so equal cards round-robin', () => {
        expect(assignToShortestColumn([100, 100, 100, 100], 2)).toEqual([
            0, 1, 0, 1,
        ]);
    });

    it('leaves the surplus columns empty when there are fewer items', () => {
        expect(assignToShortestColumn([100, 100], 3)).toEqual([0, 1]);
    });

    it('never leaves a column more than one card taller than the others', () => {
        const heights = [300, 671, 352, 186, 372];
        const totals = [0, 0, 0];

        assignToShortestColumn(heights, 3).forEach((column, index) => {
            totals[column] += heights[index];
        });

        // The greedy bound: any imbalance is smaller than the tallest card, so
        // no column can strand a hole bigger than one card.
        expect(Math.max(...totals) - Math.min(...totals)).toBeLessThan(
            Math.max(...heights),
        );
    });
});

describe('columnsFor', () => {
    it.each([
        [390, 1],
        [1023, 1],
        [1024, 2],
        [1535, 2],
        [1536, 3],
        [2560, 3],
    ])('renders %i px wide in %i column(s)', (width, columns) => {
        expect(columnsFor(width)).toBe(columns);
    });
});

describe('<Masonry />', () => {
    it('stacks everything in source order on mobile', () => {
        setWidth(390);

        const { container } = render(<Masonry items={ORDER_CARDS} />);

        expect(columnsOf(container)).toEqual([
            ['info', 'details', 'delivery', 'payments', 'notes'],
        ]);
    });

    it('balances the cards over two columns on a laptop', () => {
        setWidth(1280);

        const { container } = render(<Masonry items={ORDER_CARDS} />);

        expect(columnsOf(container)).toEqual([
            ['info', 'delivery', 'payments'],
            ['details', 'notes'],
        ]);
    });

    it('balances the cards over three columns on a wide screen', () => {
        setWidth(1600);

        const { container } = render(<Masonry items={ORDER_CARDS} />);

        // The tall detail card gets a column of its own; the short client card
        // is topped up with the payments one instead of stranding a hole.
        expect(columnsOf(container)).toEqual([
            ['info', 'payments'],
            ['details'],
            ['delivery', 'notes'],
        ]);
    });

    it('re-balances when the window is resized', () => {
        setWidth(390);

        const { container } = render(<Masonry items={ORDER_CARDS} />);
        expect(columnsOf(container)).toHaveLength(1);

        act(() => {
            setWidth(1600);
            window.dispatchEvent(new Event('resize'));
        });

        expect(columnsOf(container)).toHaveLength(3);
    });

    it('keeps every card when the window shrinks back to a single column', () => {
        setWidth(1600);

        const { container } = render(<Masonry items={ORDER_CARDS} />);
        expect(columnsOf(container)).toHaveLength(3);

        // The assignment left over from three columns points at columns that no
        // longer exist: the cards used to vanish here.
        act(() => {
            setWidth(390);
            window.dispatchEvent(new Event('resize'));
        });

        expect(columnsOf(container)).toEqual([
            ['info', 'details', 'delivery', 'payments', 'notes'],
        ]);
    });

    it('renders every item exactly once, whatever the column count', () => {
        setWidth(1600);

        const { container } = render(<Masonry items={ORDER_CARDS} />);

        expect(columnsOf(container).flat().sort()).toEqual(
            ORDER_CARDS.map((item) => item.key).sort(),
        );
    });

    it('keeps unmeasured cards in source order in the first column', () => {
        setWidth(1600);

        const items = [
            { key: 'a', content: <div data-testid="a">a</div> },
            { key: 'b', content: <div data-testid="b">b</div> },
            { key: 'c', content: <div data-testid="c">c</div> },
        ];

        const { container } = render(<Masonry items={items} />);

        // Cards that report no height are all equally short, so they end up in
        // the first column. It never shows: the measuring pass runs in a layout
        // effect, before the browser paints.
        expect(columnsOf(container)).toEqual([['a', 'b', 'c'], [], []]);
    });

    it('drops a card from the layout when it stops being rendered', () => {
        setWidth(1600);

        const { container, rerender } = render(<Masonry items={ORDER_CARDS} />);

        // A cancelled order renders no delivery card.
        rerender(
            <Masonry
                items={ORDER_CARDS.filter((item) => item.key !== 'delivery')}
            />,
        );

        expect(columnsOf(container).flat()).not.toContain('delivery');
        expect(columnsOf(container).flat()).toHaveLength(4);
    });
});
