import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface PlaceholderSectionProps {
    title: string;
    description: string;
}

export const PlaceholderSection = ({
    title,
    description,
}: PlaceholderSectionProps) => {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    This section is coming soon.
                </p>
            </CardContent>
        </Card>
    );
};
