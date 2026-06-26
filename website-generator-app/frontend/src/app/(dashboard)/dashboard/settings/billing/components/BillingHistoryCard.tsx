import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { SettingsBillingInvoiceMock } from "../../mock-settings-data";

interface BillingHistoryCardProps {
    invoices: readonly SettingsBillingInvoiceMock[];
}

const toBadgeVariant = (
    status: SettingsBillingInvoiceMock["statusLabel"],
): "default" | "secondary" | "destructive" => {
    switch (status) {
        case "paid":
            return "secondary";
        case "open":
            return "default";
        default:
            return "destructive";
    }
};

export const BillingHistoryCard = ({ invoices }: BillingHistoryCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                    Billing history
                </CardTitle>
                <CardDescription>
                    Past invoices and receipts.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {invoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Once you have invoices, they&apos;ll appear here.
                    </p>
                ) : (
                    invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                        >
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">
                                    {invoice.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {invoice.dateLabel}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-medium">
                                    {invoice.amountLabel}
                                </p>
                                <Badge variant={toBadgeVariant(invoice.statusLabel)}>
                                    {invoice.statusLabel}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
