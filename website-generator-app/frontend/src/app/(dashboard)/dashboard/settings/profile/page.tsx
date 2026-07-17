"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Clock, KeyRound, Mail, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { SettingsRow, SettingsSection } from "../components/SettingsSection";
import { DeleteAccountDialog } from "./components/DeleteAccountDialog";

const subscribeToTimezone = () => () => undefined;

const getBrowserTimezone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

const getServerTimezone = () => "Detecting...";

const AccountSettingsPage = () => {
    const { user } = useUser();
    const timezone = useSyncExternalStore(
        subscribeToTimezone,
        getBrowserTimezone,
        getServerTimezone,
    );

    return (
        <div className="space-y-8">
            <SettingsSection
                icon={Mail}
                iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                title="Account"
                description="Manage how you sign in and your regional preferences."
                className="divide-y divide-border/60"
            >
                <SettingsRow
                    icon={Mail}
                    iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    title="Email address"
                    description="Used to sign in and receive notifications."
                >
                    <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:inline">
                        {user.email}
                    </span>
                    <Button variant="outline" size="sm" disabled>
                        Change
                    </Button>
                </SettingsRow>

                <SettingsRow
                    icon={KeyRound}
                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    title="Password"
                    description="Reset the password used to access your account."
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
                </SettingsRow>

                <SettingsRow
                    icon={Clock}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    title="Timezone"
                    description="Used for dates and scheduling."
                >
                    <span className="text-sm text-muted-foreground">
                        {timezone}
                    </span>
                    <Button variant="outline" size="sm" disabled>
                        Change
                    </Button>
                </SettingsRow>
            </SettingsSection>

            <SettingsSection
                icon={TriangleAlert}
                iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
                title="Danger zone"
                description="Permanently delete your account and all associated data. This cannot be undone."
                tone="danger"
            >
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Your portfolios, uploads, and profile will be removed.
                    </p>
                    <DeleteAccountDialog />
                </div>
            </SettingsSection>
        </div>
    );
};

export default AccountSettingsPage;
