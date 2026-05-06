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
import { SETTINGS_PROFILE_MOCK } from "../mock-settings-data";

const ProfileSettingsPage = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile details</CardTitle>
                    <CardDescription>
                        Public and account profile information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-border px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Full name
                            </p>
                            <p className="mt-1 text-sm font-medium">
                                {SETTINGS_PROFILE_MOCK.fullName}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Username
                            </p>
                            <p className="mt-1 text-sm font-medium">
                                @{SETTINGS_PROFILE_MOCK.username}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Email
                            </p>
                            <p className="mt-1 text-sm font-medium">
                                {SETTINGS_PROFILE_MOCK.email}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Timezone
                            </p>
                            <p className="mt-1 text-sm font-medium">
                                {SETTINGS_PROFILE_MOCK.timezone}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Bio
                        </p>
                        <p className="mt-1 text-sm">{SETTINGS_PROFILE_MOCK.bio}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                            {SETTINGS_PROFILE_MOCK.joinedDateLabel}
                        </Badge>
                        <span>
                            Public URL: {SETTINGS_PROFILE_MOCK.publicProfilePath}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button disabled>Edit profile</Button>
                        <Button asChild variant="outline">
                            <Link href={SETTINGS_PROFILE_MOCK.publicProfilePath}>
                                View public profile
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileSettingsPage;
