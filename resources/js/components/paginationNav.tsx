import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export function PaginationNav({ links }: { links: PaginatedLink[] }) {
    return (
        <Pagination>
            <PaginationContent>
                {links.map((link) => (
                    <PaginatedItem key={link.label} link={link} />
                ))}
            </PaginationContent>
        </Pagination>
    );
}

function PaginatedItem({ link }: { link: PaginatedLink }) {
    if (link.label.includes('Anterior')) {
        return (
            <PaginationItem key={link.label}>
                <PaginationPrevious href={link.url}>
                    {link.label}
                </PaginationPrevious>
            </PaginationItem>
        );
    }

    if (link.label.includes('Siguiente')) {
        return (
            <PaginationItem key={link.label}>
                <PaginationNext href={link.url}>{link.label}</PaginationNext>
            </PaginationItem>
        );
    }

    return (
        <PaginationItem key={link.label}>
            <PaginationLink href={link.url} isActive={link.active}>
                {link.label}
            </PaginationLink>
        </PaginationItem>
    );
}
