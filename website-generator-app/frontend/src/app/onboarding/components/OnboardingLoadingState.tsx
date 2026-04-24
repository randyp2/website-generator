import { Loader2 } from "lucide-react";

import OnboardingShell from "./OnboardingShell";

const OnboardingLoadingState = () => (
    <OnboardingShell containerClassName="flex items-center justify-center px-4">
        <div className="relative flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading your profile...
        </div>
    </OnboardingShell>
);

export default OnboardingLoadingState;
