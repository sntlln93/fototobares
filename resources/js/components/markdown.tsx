import { useMemo } from 'react';

interface HeadingId {
    id: string;
    title: string;
    level: number;
}

interface MarkdownProps {
    content: string;
    headingIds?: HeadingId[];
}

export function Markdown({ content, headingIds = [] }: MarkdownProps) {
    const html = useMemo(() => {
        if (!content) return '';

        let result = content;

        // Escape HTML special characters to prevent XSS
        result = result
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Re-unescape markdown code patterns
        // Headings with IDs
        const headingMap = new Map(headingIds.map((h) => [h.title, h.id]));

        result = result.replace(/^### (.*?)$/gm, (match, title) => {
            const id = headingMap.get(title) || '';
            return `<h3 id="${id}" class="mt-6 text-lg font-semibold scroll-mt-20">${title}</h3>`;
        });
        result = result.replace(/^## (.*?)$/gm, (match, title) => {
            const id = headingMap.get(title) || '';
            return `<h2 id="${id}" class="mt-8 text-xl font-bold scroll-mt-20">${title}</h2>`;
        });
        result = result.replace(/^# (.*?)$/gm, (match, title) => {
            const id = headingMap.get(title) || '';
            return `<h1 id="${id}" class="mt-10 text-2xl font-bold scroll-mt-20">${title}</h1>`;
        });

        // Bold
        result = result.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold">$1</strong>',
        );

        // Italic
        result = result.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Code blocks with language syntax
        result = result.replace(
            /```([a-z]*)\n([\s\S]*?)```/g,
            '<pre class="my-4 overflow-x-auto rounded-lg border border-border bg-muted p-4"><code class="text-sm">$2</code></pre>',
        );

        // Inline code
        result = result.replace(
            /`([^`]+)`/g,
            '<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">$1</code>',
        );

        // Links
        result = result.replace(
            /\[(.*?)\]\((.*?)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>',
        );

        // Horizontal lines
        result = result.replace(
            /^---+$/gm,
            '<hr class="my-8 border-t border-border">',
        );

        // Unordered lists
        result = result.replace(
            /^\* (.*?)$/gm,
            '<li class="ml-6 list-disc">$1</li>',
        );
        result = result.replace(
            /^- (.*?)$/gm,
            '<li class="ml-6 list-disc">$1</li>',
        );
        result = result.replace(/(<li.*?<\/li>)/s, '<ul class="my-4">$1</ul>');

        // Ordered lists
        result = result.replace(
            /^\d+\. (.*?)$/gm,
            '<li class="ml-6 list-decimal">$1</li>',
        );
        result = result.replace(
            /(<li class="ml-6 list-decimal".*?<\/li>)/s,
            '<ol class="my-4">$1</ol>',
        );

        // Blockquotes
        result = result.replace(
            /^&gt; (.*?)$/gm,
            '<blockquote class="my-4 border-l-4 border-border pl-4 italic text-muted-foreground">$1</blockquote>',
        );

        // Paragraphs - handle multiple newlines
        let paragraphs = result.split(/\n{2,}/);
        paragraphs = paragraphs.map((para) => {
            para = para.trim();
            // Don't wrap already wrapped elements
            if (
                para.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/) ||
                para.match(/<\/(h[1-6]|ul|ol|pre|blockquote)>$/)
            ) {
                return para;
            }
            if (para) {
                return `<p class="my-4 leading-7">${para}</p>`;
            }
            return '';
        });

        result = paragraphs.join('');

        // Clean up
        result = result.replace(/<p><\/p>/g, '');
        result = result
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

        return result;
    }, [content, headingIds]);

    return (
        <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
