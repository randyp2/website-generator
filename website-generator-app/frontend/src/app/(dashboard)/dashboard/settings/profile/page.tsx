import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, Mail, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SETTINGS_PROFILE_MOCK } from "../mock-settings-data";

/** One labeled settings row: description on the left, control on the right. */
const SettingRow = ({
    label,
    help,
    children,
}: {
    label: string;
    help?: string;
    children: ReactNode;
}) => (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {help ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>
            ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
);

const AccountSettingsPage = () => {
    return (
        <div className="space-y-6">
            {/* Account */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">
                        Account
                    </CardTitle>
                    <CardDescription>
                        Manage how you sign in and your regional preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border">
                        <SettingRow
                            label="Email address"
                            help="Used to sign in and receive notifications."
                        >
                            <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:inline">
                                {SETTINGS_PROFILE_MOCK.email}
                            </span>
                            <Button variant="outline" size="sm" disabled className="gap-1.5">
                                <Mail className="h-4 w-4" />
                                Change
                            </Button>
                        </SettingRow>

                        <SettingRow
                            label="Password & 2FA"
                            help="Update your password and second-factor settings."
                        >
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                            >
                                <Link href="/dashboard/settings/security">
                                    <ShieldCheck className="h-4 w-4" />
                                    Manage in Security
                                </Link>
                            </Button>
                        </SettingRow>

                        <SettingRow
                            label="Timezone"
                            help="Used for dates and scheduling."
                        >
                            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {SETTINGS_PROFILE_MOCK.timezone}
                            </span>
                            <Button variant="outline" size="sm" disabled>
                                Change
                            </Button>
                        </SettingRow>
                    </div>
                </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-destructive/40">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight text-destructive">
                        Danger zone
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data.
                        This cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Your portfolios, uploads, and profile will be
                            removed.
                        </p>
                        <Button
                            variant="destructive"
                            disabled
                            className="gap-1.5"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountSettingsPage;
