import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SETTINGS_SECURITY_MOCK } from "../mock-settings-data";

const SecuritySettingsPage = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">
                        Sign-in security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and second-factor settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                                Two-factor authentication
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Add a second verification step at login.
                            </p>
                        </div>
                        <Badge
                            variant={
                                SETTINGS_SECURITY_MOCK.twoFactorEnabled
                                    ? "secondary"
                                    : "outline"
                            }
                        >
                            {SETTINGS_SECURITY_MOCK.twoFactorEnabled
                                ? "Enabled"
                                : "Disabled"}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button disabled>Change password</Button>
                        <Button variant="outline" disabled>
                            Configure 2FA
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">
                        Connected accounts
                    </CardTitle>
                    <CardDescription>
                        OAuth providers linked to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <p className="text-sm font-medium">GitHub</p>
                        <Badge
                            variant={
                                SETTINGS_SECURITY_MOCK.connectedAccounts.github
                                    ? "secondary"
                                    : "outline"
                            }
                        >
                            {SETTINGS_SECURITY_MOCK.connectedAccounts.github
                                ? "Connected"
                                : "Not connected"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <p className="text-sm font-medium">Google</p>
                        <Badge
                            variant={
                                SETTINGS_SECURITY_MOCK.connectedAccounts.google
                                    ? "secondary"
                                    : "outline"
                            }
                        >
                            {SETTINGS_SECURITY_MOCK.connectedAccounts.google
                                ? "Connected"
                                : "Not connected"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold tracking-tight">
                        Active sessions
                    </CardTitle>
                    <CardDescription>
                        Devices currently signed in to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {SETTINGS_SECURITY_MOCK.activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                        >
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">
                                    {session.deviceLabel}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {session.locationLabel} · {session.lastSeenLabel}
                                </p>
                            </div>
                            {session.current ? (
                                <Badge variant="secondary">Current</Badge>
                            ) : (
                                <Button size="sm" variant="outline" disabled>
                                    Sign out
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default SecuritySettingsPage;
