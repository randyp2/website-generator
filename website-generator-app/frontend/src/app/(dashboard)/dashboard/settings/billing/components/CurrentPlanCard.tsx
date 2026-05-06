import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { SettingsBillingMock } from "../../mock-settings-data";

interface CurrentPlanCardProps {
    plan: SettingsBillingMock["plan"];
}

export const CurrentPlanCard = ({ plan }: CurrentPlanCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Current plan</CardTitle>
                <CardDescription>
                    Manage your subscription, payment method, and billing
                    details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {plan.cadenceLabel}
                        </p>
                    </div>
                    <Badge variant="secondary">{plan.statusLabel}</Badge>
                </div>

                <div className="rounded-lg border border-border px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Renewal
                    </p>
                    <p className="mt-1 text-sm font-medium">{plan.renewalLabel}</p>
                </div>

                <div className="rounded-lg border border-border px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Included Credits
                    </p>
                    <p className="mt-1 text-sm font-medium">
                        {plan.monthlyCredits.toLocaleString()} credits monthly
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href="/dashboard/billing">Upgrade plan</Link>
                    </Button>
                    <Button variant="outline" disabled={!plan.manageEnabled}>
                        Manage subscription
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Manage subscription opens your Stripe billing portal.
                </p>
            </CardContent>
        </Card>
    );
};
