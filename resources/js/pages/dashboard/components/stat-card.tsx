import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function StatCard({
    title,
    value,
    hint,
    icon,
}: {
    title: string;
    value: string;
    hint: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{hint}</CardDescription>
            </CardContent>
        </Card>
    );
}
