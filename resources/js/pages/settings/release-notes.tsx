import HeadingSmall from '@/components/heading-small';
import { Markdown } from '@/components/markdown';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

interface ReleaseNotesProps {
    content: string;
}

interface HeadingItem {
    id: string;
    title: string;
    level: number;
}

export default function ReleaseNotes({ content }: ReleaseNotesProps) {
    const headings = useMemo(() => {
        const items: HeadingItem[] = [];
        const lines = content.split('\n');

        lines.forEach((line) => {
            const match = line.match(/^(#{1,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const title = match[2];
                const id = title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                items.push({ id, title, level });
            }
        });

        return items;
    }, [content]);

    return (
        <AppLayout>
            <Head title="Notas de Lanzamiento" />

            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-6">
                    <HeadingSmall
                        title="Notas de Lanzamiento"
                        description="Últimos cambios y mejoras implementados en el sistema"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Table of Contents */}
                    <div className="hidden lg:block">
                        <div className="sticky top-4 space-y-2 rounded-lg border border-border bg-card p-4">
                            <h3 className="text-sm font-semibold">Contenido</h3>
                            <nav className="space-y-1 text-sm">
                                {headings.map((heading) => (
                                    <a
                                        key={heading.id}
                                        href={`#${heading.id}`}
                                        className={`block truncate rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
                                            heading.level === 2
                                                ? 'ml-2'
                                                : heading.level === 3
                                                  ? 'ml-4'
                                                  : ''
                                        }`}
                                    >
                                        {heading.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-card p-6">
                            <Markdown content={content} headingIds={headings} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
