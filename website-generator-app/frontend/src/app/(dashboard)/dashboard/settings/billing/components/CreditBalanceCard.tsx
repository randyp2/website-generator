import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { SettingsBillingMock } from "../../mock-settings-data";

interface CreditBalanceCardProps {
    credits: SettingsBillingMock["credits"];
}

export const CreditBalanceCard = ({ credits }: CreditBalanceCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                    Credit balance
                </CardTitle>
                <CardDescription>
                    Credits are consumed by website generation runs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tracking-tight text-foreground">
                        {credits.balance.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        credits
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {credits.nextRefreshLabel}
                </p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/billing">Buy credit packs</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
