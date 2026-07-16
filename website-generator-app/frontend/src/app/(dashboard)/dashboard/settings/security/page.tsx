import { Fingerprint, KeyRound, Link2, Monitor, Smartphone } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsRow, SettingsSection } from "../components/SettingsSection";
import { SETTINGS_SECURITY_MOCK } from "../mock-settings-data";
import { PasswordResetRequest } from "./components/PasswordResetRequest";

/** Small colored status pill with a leading dot. */
const StatusPill = ({
    active,
    activeLabel,
    inactiveLabel,
}: {
    active: boolean;
    activeLabel: string;
    inactiveLabel: string;
}) => (
    <span
        className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            active
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
        )}
    >
        <span
            className={cn(
                "h-1.5 w-1.5 rounded-full",
                active ? "bg-emerald-500" : "bg-muted-foreground/50",
            )}
        />
        {active ? activeLabel : inactiveLabel}
    </span>
);

const isMobileDevice = (deviceLabel: string): boolean =>
    /iphone|android|pixel|mobile|ipad/i.test(deviceLabel);

const SecuritySettingsPage = () => {
    const security = SETTINGS_SECURITY_MOCK;

    return (
        <div className="space-y-8">
            <SettingsSection
                icon={Fingerprint}
                iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                title="Sign-in security"
                description="Manage your password and second-factor settings."
                className="divide-y divide-border/60"
            >
                <SettingsRow
                    icon={KeyRound}
                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    title="Password"
                    description="Set a strong password unique to this account."
                >
                    <PasswordResetRequest />
                </SettingsRow>

                <SettingsRow
                    icon={Fingerprint}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    title="Two-factor authentication"
                    description="Add a second verification step at login."
                >
                    <StatusPill
                        active={security.twoFactorEnabled}
                        activeLabel="Enabled"
                        inactiveLabel="Disabled"
                    />
                    <Button variant="outline" size="sm" disabled>
                        Configure
                    </Button>
                </SettingsRow>
            </SettingsSection>

            <SettingsSection
                icon={Link2}
                iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                title="Connected accounts"
                description="OAuth providers linked to your account."
                className="divide-y divide-border/60"
            >
                <SettingsRow
                    icon={FaGithub}
                    iconClassName="bg-foreground/5 text-foreground"
                    title="GitHub"
                    description="Used for repository skill verification."
                >
                    <StatusPill
                        active={security.connectedAccounts.github}
                        activeLabel="Connected"
                        inactiveLabel="Not connected"
                    />
                    <Button variant="outline" size="sm" disabled>
                        {security.connectedAccounts.github
                            ? "Disconnect"
                            : "Connect"}
                    </Button>
                </SettingsRow>

                <SettingsRow
                    icon={FcGoogle}
                    iconClassName="bg-foreground/5"
                    title="Google"
                    description="Used for one-tap sign-in."
                >
                    <StatusPill
                        active={security.connectedAccounts.google}
                        activeLabel="Connected"
                        inactiveLabel="Not connected"
                    />
                    <Button variant="outline" size="sm" disabled>
                        {security.connectedAccounts.google
                            ? "Disconnect"
                            : "Connect"}
                    </Button>
                </SettingsRow>
            </SettingsSection>

            <SettingsSection
                icon={Monitor}
                iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                title="Active sessions"
                description="Devices currently signed in to your account."
                className="divide-y divide-border/60"
            >
                {security.activeSessions.map((session) => (
                    <SettingsRow
                        key={session.id}
                        icon={
                            isMobileDevice(session.deviceLabel)
                                ? Smartphone
                                : Monitor
                        }
                        iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        title={session.deviceLabel}
                        description={`${session.locationLabel} · ${session.lastSeenLabel}`}
                    >
                        {session.current ? (
                            <StatusPill
                                active
                                activeLabel="This device"
                                inactiveLabel=""
                            />
                        ) : (
                            <Button size="sm" variant="outline" disabled>
                                Sign out
                            </Button>
                        )}
                    </SettingsRow>
                ))}
            </SettingsSection>
        </div>
    );
};

export default SecuritySettingsPage;
