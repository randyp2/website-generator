import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface UsageItem {
    label: string;
    cost: string;
}

const USAGE_ITEMS: readonly UsageItem[] = [
    { label: "Website generation", cost: "10 credits per run" },
    { label: "AI verification", cost: "5 credits per run" },
    { label: "Premium template export", cost: "2 credits per export" },
];

export const UsageTransparencySection: React.FC = () => {
    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground">
                    What credits are used for
                </CardTitle>
                <CardDescription>
                    Credits are only consumed on successful operations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <ul className="divide-y divide-border">
                    {USAGE_ITEMS.map((item: UsageItem) => (
                        <li
                            key={item.label}
                            className="flex items-center justify-between py-3 text-sm"
                        >
                            <span className="text-card-foreground">
                                {item.label}
                            </span>
                            <span className="text-muted-foreground">
                                {item.cost}
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                    No charge on failed operations.
                </p>
            </CardContent>
        </Card>
    );
};
